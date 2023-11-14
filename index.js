const fs = require('fs');
const pdf = require('pdf-parse');
const { writeFileSync, createWriteStream } = require('fs');
const { format } = require('fast-csv');


async function parsePDF(filePath) {
  let dataBuffer = fs.readFileSync(filePath);
  return pdf(dataBuffer); // returns a promise
}

function extractDataFromPDF(pdfData) {
  const lines = pdfData.text.split('\n');
  let transactions = [];
  let isTransactionSection = false;

  for (let line of lines) {
    // Identify the start of the transaction section
    if (
      line.includes('Date') &&
      line.includes('Description') &&
      line.includes('Amount')
    ) {
      isTransactionSection = true;
      continue;
    }

    // Identify the end of the transaction section (e.g., "Closing Balance")
    if (line.includes('Closing Balance')) {
      isTransactionSection = false;
      continue;
    }

    // Extract and parse transaction data
    if (isTransactionSection) {
      let [date, description, amount] = line.split(/\s{2,}/); // Split by two or more spaces
      if (date && description && amount) {
        transactions.push({
          date: date.trim(),
          description: description.trim(),
          amount: amount.trim(),
        });
      }
    }
  }

  return transactions;
}


function writeToCSV(data, outputFilePath) {
  const ws = createWriteStream(outputFilePath);
  format({ headers: true }).write(data).pipe(ws);
}

async function main() {
  const pdfFiles = ['./pdfs/62780369263 2020-09-04.pdf']; // Add your PDF file paths here
  let allData = [];

  for (const file of pdfFiles) {
    const pdfData = await parsePDF(file);
    const extractedData = extractDataFromPDF(pdfData);
    allData = allData.concat(extractedData);
  }

  writeToCSV(allData, 'output.csv');
}

main().then(() => console.log('Conversion completed.'));
