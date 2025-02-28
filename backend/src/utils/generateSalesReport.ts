import { Document, Types } from "mongoose";
import { ISale } from "../models/sales.scheema";

// Define the populated product structure
interface ProductDocument extends Document {
  _id: Types.ObjectId;
  productName: string;
  description: string;
  price: number;
}

// Define the populated customer structure
interface CustomerDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  mobileNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// Mongoose populated document type - matches the actual structure returned by Mongoose
export type MongoosePopulatedSale = Document<unknown, object, ISale> & 
  Omit<ISale, 'products' | 'customerId'> & 
  {
    products: {
      productId: ProductDocument;
      quantity: number;
      _id?: Types.ObjectId; // Make _id optional since it may not be in your schema
    }[];
    customerId?: CustomerDocument;
    _id: Types.ObjectId;
  };

export const generateSalesReport = (sales: MongoosePopulatedSale[]): string => {
  // Calculate total revenue
  const totalRevenue = sales.reduce((sum: number, sale: MongoosePopulatedSale) => sum + sale.totalPrice, 0);
  
  // Group sales by payment method
  const paymentMethodTotals: Record<string, number> = {};
  sales.forEach((sale: MongoosePopulatedSale) => {
    if (paymentMethodTotals[sale.paymentMethod]) {
      paymentMethodTotals[sale.paymentMethod] += sale.totalPrice;
    } else {
      paymentMethodTotals[sale.paymentMethod] = sale.totalPrice;
    }
  });
  
  // Get top selling products
  const productSales: Record<string, { quantity: number; revenue: number }> = {};
  sales.forEach((sale: MongoosePopulatedSale) => {
    sale.products.forEach((product) => {
      const productName = product.productId.productName;
      if (productSales[productName]) {
        productSales[productName].quantity += product.quantity;
        productSales[productName].revenue += product.quantity * product.productId.price;
      } else {
        productSales[productName] = {
          quantity: product.quantity,
          revenue: product.quantity * product.productId.price
        };
      }
    });
  });
  
  // Sort products by revenue
  const topProducts = Object.entries(productSales)
    .sort((a: [string, { quantity: number; revenue: number }], b: [string, { quantity: number; revenue: number }]) => b[1].revenue - a[1].revenue)
    .slice(0, 5);
  
  // Format dates
  const startDate = new Date(Math.min(...sales.map((sale: MongoosePopulatedSale) => new Date(sale.date).getTime())));
  const endDate = new Date(Math.max(...sales.map((sale: MongoosePopulatedSale) => new Date(sale.date).getTime())));
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  
  // Generate HTML report
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
      }
      .header {
        background-color: #4a6da7;
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 5px 5px 0 0;
      }
      .content {
        padding: 20px;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 5px 5px;
      }
      .summary {
        margin-bottom: 20px;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 5px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      th {
        background-color: #f2f2f2;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 12px;
        color: #777;
      }
      .highlight {
        font-weight: bold;
        color: #4a6da7;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Sales Report</h1>
      <p>${formatDate(startDate)} - ${formatDate(endDate)}</p>
    </div>
    <div class="content">
      <div class="summary">
        <h2>Summary</h2>
        <p>Total Sales: <span class="highlight">${sales.length}</span></p>
        <p>Total Revenue: <span class="highlight">${formatCurrency(totalRevenue)}</span></p>
        <p>Average Sale Value: <span class="highlight">${formatCurrency(totalRevenue / sales.length)}</span></p>
      </div>
      
      <h2>Payment Method Analysis</h2>
      <table>
        <tr>
          <th>Payment Method</th>
          <th>Total Revenue</th>
          <th>Percentage</th>
        </tr>
        ${Object.entries(paymentMethodTotals).map(([method, amount]: [string, number]) => `
          <tr>
            <td>${method}</td>
            <td>${formatCurrency(amount)}</td>
            <td>${((amount / totalRevenue) * 100).toFixed(2)}%</td>
          </tr>
        `).join('')}
      </table>
      
      <h2>Top Selling Products</h2>
      <table>
        <tr>
          <th>Product Name</th>
          <th>Quantity Sold</th>
          <th>Revenue</th>
        </tr>
        ${topProducts.map(([productName, data]: [string, { quantity: number; revenue: number }]) => `
          <tr>
            <td>${productName}</td>
            <td>${data.quantity}</td>
            <td>${formatCurrency(data.revenue)}</td>
          </tr>
        `).join('')}
      </table>
      
      <h2>Recent Sales</h2>
      <table>
        <tr>
          <th>Date</th>
          <th>Products</th>
          <th>Payment Method</th>
          <th>Customer</th>
          <th>Amount</th>
        </tr>
        ${sales.slice(0, 10).map((sale: MongoosePopulatedSale) => `
          <tr>
            <td>${formatDate(new Date(sale.date))}</td>
            <td>${sale.products.map((p) => `${p.productId.productName} (${p.quantity})`).join(', ')}</td>
            <td>${sale.paymentMethod}</td>
            <td>${sale.customerId ? sale.customerId.name : 'Cash Sale'}</td>
            <td>${formatCurrency(sale.totalPrice)}</td>
          </tr>
        `).join('')}
      </table>
      
      <div class="footer">
        <p>This report was automatically generated. Please do not reply to this email.</p>
        <p>© ${new Date().getFullYear()} Your Business Name</p>
      </div>
    </div>
  </body>
  </html>
  `;
  
  return html;
};