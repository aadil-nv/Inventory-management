import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Define a more specific type instead of Record<string, any>
export type DataRecord = Record<string, string | number | boolean | Date | null | undefined>;

// Export data to Excel
export const exportToExcel = <T extends DataRecord>(data: T[],fileName: string): void => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// Export data to PDF
export const exportToPdf = <T extends DataRecord>(data: T[],fileName: string,title: string): void => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Check if data exists
  if (data.length > 0) {
    // Extract column headers
    const headers = Object.keys(data[0]);
    
    // Format data for autoTable
    const formattedData = data.map(item =>
      headers.map(header => String(item[header] ?? ''))
    );
    
    // Create table
       autoTable(doc,{
      head: [headers],
      body: formattedData,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [66, 139, 202] }
    });
  } else {
    doc.text('No data available', 14, 40);
  }
  
  // Fix for PDF download issue - use output with 'blob' type and download with URL.createObjectURL
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  
  // Create temporary link element to trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.pdf`;
  link.click();
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// Print data
export const printData = <T extends DataRecord>(data: T[],title: string): void => {
  // Create a new window
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow pop-ups to print the report');
    return;
  }
  
  // Generate HTML content
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .date { margin-bottom: 20px; color: #666; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #4285f4; color: white; padding: 8px; text-align: left; }
        td { border: 1px solid #ddd; padding: 8px; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
      <button onclick="window.print(); window.close();">Print Report</button>
  `;
  
  if (data.length > 0) {
    // Extract column headers
    const headers = Object.keys(data[0]);
    
    // Create table
    htmlContent += '<table>';
    
    // Add header row
    htmlContent += '<tr>';
    headers.forEach(header => {
      htmlContent += `<th>${header}</th>`;
    });
    htmlContent += '</tr>';
    
    // Add data rows
    data.forEach(item => {
      htmlContent += '<tr>';
      headers.forEach(header => {
        htmlContent += `<td>${item[header] ?? ''}</td>`;
      });
      htmlContent += '</tr>';
    });
    
    htmlContent += '</table>';
  } else {
    htmlContent += '<p>No data available</p>';
  }
  
  // Close HTML
  htmlContent += `
    </body>
    </html>
  `;
  
  // Write to new window and trigger print
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load before printing
  printWindow.onload = function() {
    // For browsers that don't automatically trigger print
    setTimeout(() => {
      printWindow.focus();
    }, 500);
  };
};