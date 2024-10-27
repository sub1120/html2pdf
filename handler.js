const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

exports.html2pdf = async (event) => {
  console.info("event", event)
  
  const { html, pdfOptions } = event.body ? JSON.parse(Buffer.from(event.body, "base64").toString()) : {};

  console.info("html", html);
  console.info("pdfOptions", pdfOptions);

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    await page.setContent(html || `<h1>Hello from pdf</h1>`, {
      waitUntil:"networkidle0"
    });
    
    const defaultPdfOptions = { printBackground: true, format: 'A4' };
    const options = { ...defaultPdfOptions, ...pdfOptions };

    const pdfBuffer = await page.pdf(options);
    console.info("pdfBuffer", pdfBuffer);

    await browser.close();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true,
    };

  } catch (err) {
    console.error(err)
    return {
      statusCode: 400,
      body: JSON.stringify(err),
    };
  }
};
