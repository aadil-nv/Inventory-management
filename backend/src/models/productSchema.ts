import mongoose, { Schema, Document } from "mongoose";

interface IProduct extends Document {
  productName: string;
  description: string;
  quantity: number;
  price: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    productName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
