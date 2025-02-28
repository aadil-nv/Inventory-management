import { ICustomer } from '../models/customer.schema'; // Using the correct import path

/**
 * Generates an HTML report of customer information in table format
 * @param customers Array of customer documents
 * @returns HTML formatted string containing customer information
 */
export const generateCustomerReport = (customers: ICustomer[]): string => {
  // Function to sanitize text to prevent XSS attacks
  const sanitizeText = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Generate the current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate summary statistics
  const customersByCountry: Record<string, number> = {};
  customers.forEach(customer => {
    const country = customer.address.country;
    customersByCountry[country] = (customersByCountry[country] || 0) + 1;
  });

  // Generate HTML with table layout
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          width: 100%; 
          max-width: 900px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          padding-bottom: 15px; 
          border-bottom: 2px solid #3498db; 
        }
        .header h1 { 
          color: #2c3e50; 
          margin-bottom: 10px; 
        }
        .meta-info { 
          color: #7f8c8d; 
          font-size: 14px; 
        }
        .section-title { 
          background-color: #3498db; 
          color: white; 
          padding: 10px 15px; 
          margin-top: 30px; 
          margin-bottom: 15px; 
          border-radius: 5px; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 30px; 
        }
        th { 
          background-color: #f8f9fa; 
          text-align: left; 
          padding: 12px; 
          border: 1px solid #ddd; 
          font-weight: bold; 
        }
        td { 
          padding: 12px; 
          border: 1px solid #ddd; 
          vertical-align: top; 
        }
        tr:nth-child(even) { 
          background-color: #f2f2f2; 
        }
        tr:hover { 
          background-color: #e9f7fe; 
        }
        .summary { 
          background-color: #f8f9fa; 
          padding: 15px; 
          border-radius: 5px; 
          margin-top: 30px; 
          border: 1px solid #ddd; 
        }
        .summary-table { 
          width: 50%; 
          margin-top: 15px; 
        }
        .footer { 
          margin-top: 30px; 
          padding-top: 15px; 
          border-top: 1px solid #eee; 
          font-size: 12px; 
          color: #7f8c8d; 
          text-align: center; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Customer Management Report</h1>
          <div class="meta-info">
            <p>Generated on: ${sanitizeText(currentDate)}</p>
            <p>Total Customers: ${customers.length}</p>
          </div>
        </div>

        <h2 class="section-title">Customer Database</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Contact Information</th>
              <th>Address</th>
              <th>Registration Date</th>
            </tr>
          </thead>
          <tbody>
  `;

  // Generate table rows for each customer
  customers.forEach((customer, index) => {
    const createdDate = new Date().toLocaleDateString();
    
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${sanitizeText(customer.name)}</td>
        <td>
          <strong>Email:</strong> ${sanitizeText(customer.email)}<br>
          <strong>Phone:</strong> ${sanitizeText(customer.mobileNumber)}
        </td>
        <td>
          ${sanitizeText(customer.address.street)},<br>
          ${sanitizeText(customer.address.city)},<br>
          ${sanitizeText(customer.address.state)} ${sanitizeText(customer.address.zipCode)},<br>
          ${sanitizeText(customer.address.country)}
        </td>
        <td>${createdDate}</td>
      </tr>
    `;
  });

  // Generate summary section with geographical distribution
  html += `
          </tbody>
        </table>

        <h2 class="section-title">Customer Demographics</h2>
        <div class="summary">
          <h3>Geographical Distribution</h3>
          <table class="summary-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Number of Customers</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
  `;

  // Add country distribution data
  Object.keys(customersByCountry).forEach(country => {
    const count = customersByCountry[country];
    const percentage = ((count / customers.length) * 100).toFixed(1);
    
    html += `
      <tr>
        <td>${sanitizeText(country)}</td>
        <td>${count}</td>
        <td>${percentage}%</td>
      </tr>
    `;
  });

  // Close the HTML structure
  html += `
            </tbody>
          </table>
        </div>

        <div class="summary">
          <h3>Report Summary</h3>
          <p>This report provides an overview of all registered customers in your database.</p>
          <p>Key information:</p>
          <ul>
            <li>Total customer count: ${customers.length}</li>
            <li>Customers are located in ${Object.keys(customersByCountry).length} different countries</li>
          </ul>
          <p>For detailed customer analytics and management tools, please access your dashboard.</p>
        </div>

        <div class="footer">
          <p>This is an automated report. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
};