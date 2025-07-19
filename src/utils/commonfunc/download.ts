import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (data: object[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (
  headers: string[],
  rows: (string | number | boolean | null)[][],
  fileName: string
) => {
  const doc = new jsPDF();
  autoTable(doc, {
    head: [headers],
    body: rows,
  });
  doc.save(`${fileName}.pdf`);
};
