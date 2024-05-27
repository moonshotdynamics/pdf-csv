const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');
const ExcelJS = require('exceljs');
const csv = require('fast-csv');

async function parsePDF(filePath) {
  let dataBuffer = fs.readFileSync(filePath);
  return pdf(dataBuffer); // returns a promise
}

function extractYearFromPDF(pdfData) {
  const lines = pdfData.text.split('\n');
  for (let line of lines) {
    const yearMatch = line.match(/Statement Period : .* \d{4}/);
    if (yearMatch) {
      const year = yearMatch[0].split(' ').pop();
      return year;
    }
  }
  return '';
}

function extractDataFromPDF(pdfData, year) {
  const lines = pdfData.text.split('\n');
  let transactions = [];
  let isTransactionSection = false;

  for (let line of lines) {
    if (line.includes('Transactions in RAND (ZAR)')) {
      isTransactionSection = true;
      continue;
    }

    if (line.includes('Closing Balance')) {
      isTransactionSection = false;
      continue;
    }

    if (isTransactionSection && line.trim()) {
      const transaction = parseTransaction(line, year);
      if (transaction) {
        transactions.push(transaction);
      }
    }
  }

  return transactions;
}

function parseTransaction(line, year) {
  const dateMatch = line.match(/^\d{2} [A-Za-z]+/);
  const amountMatch = line.match(/[\d.,]+(Cr|Dr)/);
  const balanceMatch = line.match(/[\d.,]+(Cr|Dr)$/);

  if (dateMatch && amountMatch && balanceMatch) {
    const date = `${dateMatch[0]} ${year}`;
    const amount = amountMatch[0];
    const balance = balanceMatch[0];
    const descriptionStartIndex = dateMatch[0].length;
    const descriptionEndIndex = line.indexOf(amount);
    const description = line
      .substring(descriptionStartIndex, descriptionEndIndex)
      .trim();

    return {
      date: formatDate(date.trim()),
      description: description.replace(/,\d{2}[A-Za-z]+/, '').trim(),
      amount: amount.trim(),
      balance: balance.trim(),
    };
  }
  return null;
}

function formatDate(dateStr) {
  const parts = dateStr.split(' ');
  const day = parts[0].padStart(2, '0');
  const month = parts[1].match(
    /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/
  )[0]; // Extract only the month part
  const year = parts[2];

  return `${day} ${month} ${year}`;
}

async function writeToExcel(data, outputFilePath) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Transactions');

  // Add header row
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Description', key: 'description', width: 50 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Balance', key: 'balance', width: 15 },
  ];

  // Add data rows with formatting
  data.forEach((item) => {
    const row = worksheet.addRow(item);
    if (item.amount.includes('Cr')) {
      row.getCell('amount').font = { bold: false };
    }
  });

  await workbook.xlsx.writeFile(outputFilePath);
  console.log('Done writing to Excel file.');
}

function writeToCSV(data, outputFilePath) {
  const csvStream = csv.format({ headers: true });
  const writableStream = fs.createWriteStream(outputFilePath);

  csvStream.pipe(writableStream).on('finish', function () {
    console.log('Done writing to CSV file.');
  });

  data.forEach((item) => csvStream.write(item));
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
    const year = extractYearFromPDF(pdfData);
    const extractedData = extractDataFromPDF(pdfData, year);
    allData = allData.concat(extractedData);
  }

  // Sort the data by date
  allData.sort((a, b) => {
    const dateA = new Date(a.date.split(' ').reverse().join('-'));
    const dateB = new Date(b.date.split(' ').reverse().join('-'));
    return dateA - dateB;
  });

  await writeToExcel(allData, 'output.xlsx');
  writeToCSV(allData, 'output.csv');
}

main().then(() => console.log('Conversion completed.'));
