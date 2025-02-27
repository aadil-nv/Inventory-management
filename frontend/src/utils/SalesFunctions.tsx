// File: src/utils/exportUtils.ts

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Sale } from './Type';
import autoTable from "jspdf-autotable";
import { message } from 'antd';
import { userInstance } from '../middlewares/axios';


// Define types for export options
export type ExportFormat = 'excel' | 'pdf' | 'print';
export type EmailData = {
  email: string;
  subject: string;
  message: string;
};
interface EmailResponse {
    success: boolean;
    message: string;
  }
  
// Helper function to format sales data for export
const formatSalesData = (sales: Sale[]): Record<string, string | number>[] => {
  return sales.map(sale => {
    // Format customer name
    let customerName = 'Cash Sale';
    if (sale.customerId && typeof sale.customerId === 'object' && 'name' in sale.customerId) {
      customerName = sale.customerId.name;
    } else if (sale.customerName) {
      customerName = sale.customerName;
    }
    
    // Format products
    const productsText = sale.products.map(p => {
      let productName = 'Unknown';
      if (typeof p.productId === 'object' && p.productId && 'productName' in p.productId) {
        productName = p.productId.productName;
      }
      return `${productName} x ${p.quantity}`;
    }).join(', ');
    
    // Return formatted row
    return {
      ID: sale._id,
      Customer: customerName,
      Products: productsText,
      'Payment Method': sale.paymentMethod,
      'Total Price': `$${sale.totalPrice.toFixed(2)}`,
      Date: new Date(sale.date).toLocaleDateString(),
    };
  });
};

// Export to Excel
export const exportToExcel = (sales: Sale[], fileName: string = 'sales-report'): void => {
  try {
    const formattedData = formatSalesData(sales);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
    
    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export Excel file');
  }
};

// Export to PDF
export const exportToPdf = (sales: Sale[], fileName: string = 'sales-report'): void => {
    try {
      const formattedData = formatSalesData(sales);
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Sales Report', 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Create table with sales data
      const tableColumn = Object.keys(formattedData[0]);
      const tableRows = formattedData.map(data => Object.values(data));
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        styles: { fontSize: 8 },
        columnStyles: { 0: { cellWidth: 25 } }, // Adjust ID column width
        headStyles: { fillColor: [66, 139, 202] },
      });
  
      // Save PDF
      doc.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Failed to export PDF file');
    }
  };

// Print sales data
export const printSalesData = (sales: Sale[]): void => {
  try {
    const formattedData = formatSalesData(sales);
    
    // Create a printable HTML table
    const  printContent = `
      <html>
        <head>
          <title>Sales Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { margin-bottom: 20px; }
            h1 { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sales Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${Object.keys(formattedData[0]).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${formattedData.map(row => `
                <tr>
                  ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Slight delay to ensure content is loaded
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } else {
      throw new Error('Failed to open print window. Please check popup settings.');
    }
  } catch (error) {
    console.error('Error printing sales data:', error);
    throw new Error('Failed to print sales data');
  }
};

// Send email with sales data
export const sendSalesReportEmail = async (
  sales: Sale[], 
  emailData: EmailData,
  format: ExportFormat = 'pdf'
): Promise<void> => {
  try {
    // In a real app, this would call your API to handle email sending
    // Here's a placeholder implementation
    const formattedData = formatSalesData(sales);
    
    // Create form data for API call
    const formData = new FormData();
    formData.append('recipientEmail', emailData.email);
    formData.append('subject', emailData.subject);
    formData.append('message', emailData.message);
    formData.append('format', format);
    formData.append('salesData', JSON.stringify(formattedData));
    
 
    
    
    const response = await userInstance.post<EmailResponse>('api/sale/send-sales-details', {
        email:emailData.email,
        subject: emailData.subject,
        message: emailData.message,
        
      });
      
      if (response.data.success) {
        message.success('Products data sent via email successfully');
      } else {
        message.error('Failed to send email');
      }
    
    // For now, just return success
    return Promise.resolve();
  } catch (error) {
    console.error('Error sending email:', error);
    message.error('Failed to send email');
    throw new Error('Failed to send email');
  }
};