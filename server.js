const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3008;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4201', 'http://127.0.0.1:4200', 'http://127.0.0.1:4201'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const EXCEL_PATH = 'T:\\Lib-Proj\\library.xlsx';

function getWorkbook() {
  if (fs.existsSync(EXCEL_PATH)) {
    return XLSX.readFile(EXCEL_PATH);
  } else {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, 'PurchaseRecords');
    return wb;
  }
}

function getSheetData(wb) {
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(ws);
}

function saveToExcel(data) {
  try {
    const wb = getWorkbook();
    const sheetName = wb.SheetNames[0] || 'PurchaseRecords';
    
    // Ensure all records have all required fields with defaults
    const normalizedData = data.map(row => ({
      'ID': row['ID'] || '',
      'S.No': row['S.No'] || '',
      'Book Title': row['Book Title'] || '',
      'Author': row['Author'] || '',
      'ISBN': row['ISBN'] || '',
      'Purchase Date': row['Purchase Date'] || '',
      'Price': row['Price'] || 0,
      'Qty': row['Qty'] || 0,
      'Supply': row['Supply'] || 'Govt supply',
      'Rack': row['Rack'] || 'GF-Rack-A',
      'Accession Number': row['Accession Number'] || '',
      'Publisher': row['Publisher'] || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(normalizedData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 10 }, { wch: 6 }, { wch: 30 }, { wch: 20 }, 
      { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 8 },
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 20 }
    ];
    
    wb.Sheets[sheetName] = ws;
    XLSX.writeFile(wb, EXCEL_PATH);
    console.log(`Server: Successfully saved ${data.length} records to ${EXCEL_PATH}`);
  } catch (error) {
    if (error.code === 'EBUSY') {
      console.error('Server Error: Excel file is open in another program. Please close it.');
    } else {
      console.error('Server Error saving to Excel:', error);
    }
    throw error;
  }
}

// GET all books
app.get('/api/books', (req, res) => {
  try {
    const wb = getWorkbook();
    const data = getSheetData(wb);
    console.log(`GET /api/books: Found ${data.length} raw rows in Excel`);
    
    // Map Excel format back to Book model
    const books = data.map(row => ({
      id: row['ID'] ? row['ID'].toString() : Date.now().toString(),
      title: row['Book Title'] || '',
      author: row['Author'] || '',
      isbn: row['ISBN'] || '',
      purchaseDate: row['Purchase Date'] || '',
      price: Number(row['Price']) || 0,
      quantity: Number(row['Qty']) || 0,
      supply: row['Supply'] || 'Govt supply',
      rack: row['Rack'] || 'GF-Rack-A',
      accessionNum: row['Accession Number'] || '',
      publisher: row['Publisher'] || ''
    }));
    
    console.log(`GET /api/books: Returning ${books.length} records`);
    console.log('Sample record sample:', JSON.stringify(books[0] || {}));
    res.status(200).send(books);
  } catch (error) {
    console.error('Error reading Excel:', error);
    res.status(500).send({ error: 'Failed to read Excel file' });
  }
});

// POST new book
app.post('/api/books', (req, res) => {
  try {
    const book = req.body;
    const wb = getWorkbook();
    const data = getSheetData(wb);

    data.push({
      'ID': book.id,
      'S.No': data.length + 1,
      'Book Title': book.title,
      'Author': book.author,
      'ISBN': book.isbn,
      'Purchase Date': book.purchaseDate,
      'Price': book.price,
      'Qty': book.quantity,
      'Supply': book.supply,
      'Rack': book.rack,
      'Accession Number': book.accessionNum,
      'Publisher': book.publisher
    });

    console.log(`POST /api/books: Added book "${book.title}"`);
    saveToExcel(data);
    res.status(200).send({ message: 'Book added to Excel successfully' });
  } catch (error) {
    console.error('Error adding to Excel:', error);
    res.status(500).send({ error: 'Failed to write to Excel file' });
  }
});

// PUT update book
app.put('/api/books/:id', (req, res) => {
    try {
      const id = req.params.id;
      const updatedBook = req.body;
      const wb = getWorkbook();
      const data = getSheetData(wb);
  
      const index = data.findIndex(row => row['ID'] == id);
      if (index !== -1) {
        data[index] = {
          ...data[index],
          'Book Title': updatedBook.title,
          'Author': updatedBook.author,
          'ISBN': updatedBook.isbn,
          'Purchase Date': updatedBook.purchaseDate,
          'Price': updatedBook.price,
          'Qty': updatedBook.quantity,
          'Supply': updatedBook.supply,
          'Rack': updatedBook.rack,
          'Accession Number': updatedBook.accessionNum,
          'Publisher': updatedBook.publisher
        };
        console.log(`PUT /api/books/${id}: Updated book`);
        saveToExcel(data);
        res.status(200).send({ message: 'Book updated in Excel' });
      } else {
        res.status(404).send({ error: 'Book not found' });
      }
    } catch (error) {
      res.status(500).send({ error: 'Failed to update Excel file' });
    }
  });

// DELETE book
app.delete('/api/books/:id', (req, res) => {
    try {
      const id = req.params.id;
      console.log(`DELETE request received for ID: ${id}`);
      const wb = getWorkbook();
      let data = getSheetData(wb);
      
      console.log(`Current books in Excel: ${data.length}`);
      console.log('Available IDs:', data.map(row => row['ID']));
  
      const initialLength = data.length;
      data = data.filter(row => row['ID'] != id);
      
      if (data.length < initialLength) {
        // Recalculate S.No
        data = data.map((row, i) => ({ ...row, 'S.No': i + 1 }));
        console.log(`DELETE /api/books/${id}: Deleted book`);
        saveToExcel(data);
        res.status(200).send({ message: 'Book deleted from Excel' });
      } else {
        console.log(`Book not found with ID: ${id}`);
        res.status(404).send({ error: 'Book not found' });
      }
    } catch (error) {
      console.error('DELETE error:', error);
      res.status(500).send({ error: 'Failed to delete from Excel file' });
    }
  });

app.listen(port, 'localhost', () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API endpoints available at:`);
  console.log(`  GET    http://localhost:${port}/api/books`);
  console.log(`  POST   http://localhost:${port}/api/books`);
  console.log(`  PUT    http://localhost:${port}/api/books/:id`);
  console.log(`  DELETE http://localhost:${port}/api/books/:id`);
  console.log(`  Health http://localhost:${port}/health`);
  console.log('');
  console.log('CORS is enabled for: http://localhost:4200, http://localhost:4201');
  console.log('Proxy configuration should route /api/* requests here');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please close the other application or use a different port.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
