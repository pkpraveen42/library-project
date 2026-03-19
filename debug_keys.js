const XLSX = require('xlsx');
const excelPath = 'T:\\Lib-Proj\\library.xlsx';

try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log('Total Rows:', data.length);
    if (data.length > 0) {
        console.log('Keys in first row:', Object.keys(data[0]));
        console.log('First row data:', JSON.stringify(data[0], null, 2));
    }
} catch (error) {
    console.error('Error:', error.message);
}
