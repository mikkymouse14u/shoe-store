// Simple converter: render Markdown to HTML and print to PDF with Puppeteer
// Usage:
// npm install puppeteer markdown-it
// node scripts/convert-to-pdf.js docs/Frontend-Backend-Integration-Lesson.md lesson.pdf

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const MarkdownIt = require('markdown-it');

async function mdToPdf(mdPath, outPdf) {
  const md = new MarkdownIt({ html: true });
  const mdText = fs.readFileSync(mdPath, 'utf8');
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Lesson</title><style>body{font-family:Arial,Helvetica,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#111}pre{background:#f6f8fa;padding:12px;border-radius:6px;overflow:auto}</style></head><body>${md.render(mdText)}</body></html>`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outPdf, format: 'A4', printBackground: true });
  await browser.close();
}

(async () => {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/convert-to-pdf.js <input.md> <output.pdf>');
    process.exit(2);
  }
  const mdPath = path.resolve(args[0]);
  const outPdf = path.resolve(args[1]);
  try {
    await mdToPdf(mdPath, outPdf);
    console.log('Wrote', outPdf);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
