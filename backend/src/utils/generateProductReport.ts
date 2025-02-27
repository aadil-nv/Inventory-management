import mongoose from "mongoose";

interface IProduct  {
  userId: mongoose.Types.ObjectId; // Reference to the user
  productName: string;
  description: string;
  quantity: number;
  price: number;
}
export const generateProductReport = (products: IProduct[]): string => {
  // Format the current date for the report
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calculate total value of inventory
  const totalValue = products.reduce((sum, product) => {
    return sum + (product.quantity * product.price);
  }, 0);
  
  // Filter out userId and _id from each product for the report
  const productData = products.map(product => {
    const { productName, description, quantity, price } = product;
    return { productName, description, quantity, price };
  });
  
  // Create HTML for the product table rows
  const productRows = productData.map(product => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.productName}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.description}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${product.quantity}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${product.price.toFixed(2)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${(product.quantity * product.price).toFixed(2)}</td>
    </tr>
  `).join('');
  
  // Return complete HTML report
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
      }
      .report-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      .report-date {
        font-size: 14px;
        color: #666;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      th {
        background-color: #f2f2f2;
        text-align: left;
        padding: 10px 8px;
        border: 1px solid #ddd;
        font-weight: bold;
      }
      .summary {
        margin-top: 20px;
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 4px;
      }
      .footer {
        margin-top: 20px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="report-title">Products Inventory Report</div>
        <div class="report-date">Generated on: ${formattedDate}</div>
      </div>
      
      <p>This report contains details of all products currently in inventory.</p>
      
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Description</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total Value</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>
      
      <div class="summary">
        <p><strong>Inventory Summary</strong></p>
        <p>Total Products: ${products.length}</p>
        <p>Total Inventory Value: $${totalValue.toFixed(2)}</p>
      </div>
      
      <div class="footer">
        <p>This is an automated inventory report. Please do not reply to this email.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};