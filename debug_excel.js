const XLSX = require('xlsx');
const EXCEL_PATH = 'T:\\Lib-Proj\\library.xlsx';

try {
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(JSON.stringify(data, null, 2));
} catch (error) {
    console.error('Error reading excel:', error.message);
}
