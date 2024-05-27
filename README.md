# FNB PDF Data Extractor

This project is a simple Node.js application that extracts FNB transaction data from PDF files and writes it to a CSV file. 
The PDF files should be in a specific format, with a transaction section that starts with a line containing 'Date', 'Description', and 'Amount', and ends with a line containing 'Closing Balance'. 
Each transaction line should be split into date, description, and amount by two or more spaces.

## Prerequisites

- Node.js
- npm

## Installation

1. Clone the repository:
2. Navigate to the project directory:
3. Install the dependencies: npm install

## Usage

1. Place your PDF files in the `pdfs` directory.
2. Run the application: node index.js

3. The extracted data will be written to `output.csv` in the project directory.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT License

Copyright (c) [year] [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
