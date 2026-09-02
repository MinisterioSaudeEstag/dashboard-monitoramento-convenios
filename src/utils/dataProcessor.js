import * as XLSX from 'xlsx';

export const processExcelFile = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
    
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet, { defval: null });
    
    callback(rawData);
  };
  reader.readAsBinaryString(file);
};

export const formatBillion = (value) => {
  if (!value || value === 0) return "0,00 Bi";
  return (value / 1000000000).toFixed(2).replace('.', ',') + " Bi";
};