const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');
const { writeFileSync, createWriteStream } = require('fs');
const { format } = require('fast-csv');

const csv = require('fast-csv');


async function parsePDF(filePath) {
  let dataBuffer = fs.readFileSync(filePath);
  return pdf(dataBuffer); // returns a promise
}

function extractDataFromPDF(pdfData, year) {
  const lines = pdfData.text.split('\n');
  let transactions = [];
  let isTransactionSection = false;
  let formatType = null;

  for (let line of lines) {
    // Check for the format of the bank statement
    if (
      line.includes('DateDescriptionAmount') ||
      line.includes('Transactions in RAND (ZAR)')
    ) {
      isTransactionSection = true;
      formatType = line.includes('DateDescriptionAmount')
        ? 'format1'
        : 'format2';
      continue;
    }

    if (line.includes('Closing Balance')) {
      isTransactionSection = false;
      continue;
    }

    if (isTransactionSection && line.trim()) {
      let transaction;
      if (formatType === 'format1') {
        transaction = parseFormat1(line, year);
      } else if (formatType === 'format2') {
        transaction = parseFormat2(line, year);
      }

      if (transaction) {
        transactions.push(transaction);
      }
    }
  }

  return transactions;
}

function parseFormat1(line, year) {
  // Parsing logic for the first format
  const dateMatch = line.match(/^\d{2}[A-Za-z]+/);
  const amountMatch = line.match(/[\d.]+(Cr|Dr)/);

  if (dateMatch && amountMatch) {
    const date = `${dateMatch[0]} ${year}`;
    const amount = amountMatch[0];
    const descriptionStartIndex = dateMatch[0].length;
    const descriptionEndIndex = line.indexOf(amount);
    const description = line
      .substring(descriptionStartIndex, descriptionEndIndex)
      .trim();

    return {
      date: date.trim(),
      description: description,
      amount: amount.trim(),
    };
  }
  return null;
}

function parseFormat2(line, year) {
  // Parsing logic for the second format
  const dateMatch = line.match(/^\d{2} [A-Za-z]+/);
  const amountMatch = line.match(/[\d.,]+(Cr|Dr)/g);

  if (dateMatch && amountMatch && amountMatch.length > 0) {
    const date = `${dateMatch[0]} ${year}`;
    const amount = amountMatch[0];
    const descriptionStartIndex =
      line.indexOf(dateMatch[0]) + dateMatch[0].length;
    const descriptionEndIndex = line.indexOf(amount);
    const description = line
      .substring(descriptionStartIndex, descriptionEndIndex)
      .trim();

    return {
      date: date.trim(),
      description: description,
      amount: amount.trim(),
    };
  }
  return null;
}








function writeToCSV(data, outputFilePath) {
  const csvStream = csv.format({ headers: true });
  const writableStream = createWriteStream(outputFilePath);

  csvStream.pipe(writableStream).on('finish', function() {
    console.log('Done writing to CSV file.');
  });

  data.forEach(item => csvStream.write(item));
  csvStream.end();
}

async function main() {
  const pdfDirectory = './pdfs'; // Directory containing the PDF files
  const pdfFiles = fs
    .readdirSync(pdfDirectory)
    .filter((file) => path.extname(file).toLowerCase() === '.pdf')
    .map((file) => path.join(pdfDirectory, file));
  let allData = [];

  for (const file of pdfFiles) {
    const pdfData = await parsePDF(file);
    const yearMatch = file.match(/(?<=\s)\d{4}(?=-)/);
    const year = yearMatch ? yearMatch[0] : '';
    const extractedData = extractDataFromPDF(pdfData, year);
    allData = allData.concat(extractedData);
  }

  writeToCSV(allData, 'output.csv');
}

main().then(() => console.log('Conversion completed.'));
