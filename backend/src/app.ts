import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"

dotenv.config();

import errorHandler from "./middlewares/errorHandler";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import connectDB from "./config/connectDB";

connectDB();

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); 

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
