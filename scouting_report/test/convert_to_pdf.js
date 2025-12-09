const puppeteer = require('puppeteer');
const path = require('path');

async function convertHtmlToPdf() {
    const inputPath = path.join(__dirname, 'sample_report_anonymized.html');
    const outputPath = path.join(__dirname, 'sample_report_anonymized.pdf');
    
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new'
    });
    
    const page = await browser.newPage();
    
    console.log(`Loading HTML file: ${inputPath}`);
    await page.goto(`file://${inputPath}`, {
        waitUntil: 'networkidle0'
    });
    
    console.log(`Generating PDF: ${outputPath}`);
    await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: {
            top: '20mm',
            right: '15mm',
            bottom: '20mm',
            left: '15mm'
        },
        printBackground: true
    });
    
    await browser.close();
    console.log('PDF generated successfully!');
    console.log(`Output: ${outputPath}`);
}

convertHtmlToPdf().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

