import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the user
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

const CustomerSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Linking customer to a user
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobileNumber: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
  },
  { timestamps: true } // Adds createdAt & updatedAt fields
);

export const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);
