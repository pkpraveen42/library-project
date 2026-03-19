const XLSX = require('xlsx');
const excelPath = 'T:\\Lib-Proj\\library.xlsx';

try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (rawData.length > 0) {
        console.log('--- HEADER ROW ---');
        rawData[0].forEach((h, i) => console.log(`${i}: "${h}"`));
        console.log('--- FIRST DATA ROW ---');
        if (rawData.length > 1) {
            rawData[1].forEach((v, i) => console.log(`${i}: "${v}"`));
        }
    } else {
        console.log('No data found in sheet.');
    }
} catch (error) {
    console.error('Error reading excel:', error.message);
}
