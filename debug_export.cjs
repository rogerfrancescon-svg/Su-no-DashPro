const XLSX = require('xlsx');

const dataToExport = [
  { 'A': 1, 'B': 2 }
];
const ws = XLSX.utils.json_to_sheet(dataToExport);
console.log(ws);
