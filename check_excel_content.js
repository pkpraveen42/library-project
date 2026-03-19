const XLSX = require('xlsx');
const excelPath = 'T:\\Lib-Proj\\library.xlsx';
try {
  const wb = XLSX.readFile(excelPath);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws);
  console.log('Number of rows:', data.length);
  if (data.length > 0) {
    console.log('First 5 rows:', JSON.stringify(data.slice(0, 5), null, 2));
  }
} catch (e) {
  console.error('Error reading file:', e);
}
