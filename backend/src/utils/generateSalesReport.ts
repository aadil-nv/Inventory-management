import { ISale } from "../models/sales.scheema";

export const generateSalesReport = (sales: ISale[]): string => {
    const reportHeader = `
      <h2>Sales Report</h2>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr>
          <th>Date</th>
          <th>Product Name</th>
          <th>Quantity</th>
          <th>Payment Method</th>
          <th>Total Price</th>
        </tr>
    `;
  
    const reportRows = sales
      .map((sale) =>
        sale.products
          .map((item) => {
            const productName =
              typeof item.productId === "object" && "name" in item.productId
                ? item.productId.name
                : "Unknown Product"; // Handle missing name
  
            return `
            <tr>
              <td>${new Date(sale.date).toLocaleDateString()}</td>
              <td>${productName}</td>
              <td>${item.quantity}</td>
              <td>${sale.paymentMethod}</td>
              <td>${sale.totalPrice.toFixed(2)}</td>
            </tr>
          `;
          })
          .join("")
      )
      .join("");
  
    return reportHeader + reportRows + "</table>";
  };
  