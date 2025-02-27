interface Product {
    _id: string;
    productName: string;
    description: string;
    quantity: number;
    price: number;
  }
  
  interface Customer {
    _id: string;
    name: string;
  }
  
  interface SaleProduct {
    productId: string | Product;  // Can be either a string ID or a populated Product object
    quantity: number;
    _id?: string;
  }
  
  type PaymentMethod = "Cash" | "Online" | "Credit Card" | "Debit Card" | "UPI" | "Bank Transfer";

export interface Sale {
    // define the properties of the Sale type here
    _id: string;
    products: SaleProduct[];
    customerId?: string | Customer;
    customerName?: string;
    paymentMethod: PaymentMethod;
    totalPrice: number;
    date: string;
  }