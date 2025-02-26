import mongoose, { Schema, Document } from "mongoose";

export interface ISale extends Document {
  products: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  customerId?: mongoose.Types.ObjectId; // Optional if it's a cash sale
  paymentMethod: "Cash" | "Online" | "Credit Card" | "Debit Card" | "UPI" | "Bank Transfer";
  totalPrice: number;
  date: Date;
}

const SaleSchema: Schema = new Schema(
  {
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
      }
    ],
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: false }, // Optional for cash sales
    paymentMethod: { type: String, enum: ["Cash", "Online", "Credit Card", "Debit Card", "UPI", "Bank Transfer"], required: true },
    totalPrice: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Sale = mongoose.model<ISale>("Sale", SaleSchema);
