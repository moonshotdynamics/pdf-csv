const fs = require('fs');
const PDFParser = require('pdf2json');

// Get the list of PDF files to import
const pdfFiles = fs.readdirSync('./pdfs');

// Create a CSV file to store the bank statements
const csvFile = fs.createWriteStream('./bank_statements.csv');

// Loop through the PDF files and import them
pdfFiles.forEach((file) => {
  // Create a new PDFParser object
  const parser = new PDFParser();

  parser.on('pdfParser_dataError', (errData) =>
    console.error(errData.parserError)
  );
  parser.on('pdfParser_dataReady', (pdfData) => {
    // Get the bank statement data
    console.log(pdfData);
    const bankStatementData = pdfData.Pages[0].Texts;

    // Write the bank statement data to the CSV file
    csvFile.write(bankStatementData.join(',') + '\n');
  });

  // Parse the PDF file
  parser.loadPDF(`./pdfs/${file}`);
});

// Close the CSV file
csvFile.end();
