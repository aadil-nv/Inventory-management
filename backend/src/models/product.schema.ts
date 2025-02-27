import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the user
  productName: string;
  description: string;
  quantity: number;
  price: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Linking product to a user
    productName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
