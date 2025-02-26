import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"

dotenv.config();

import {errorHandler} from "./middlewares/errorHandler";
import {authRouter} from "./routes/auth.routes";
import {userRouter} from "./routes/user.routes";
import {customerRouter} from "./routes/customer.routes";
import {productRouter} from "./routes/product.routes";
import {salesRouter} from "./routes/sales.routes";
import {connectDB} from "./config/connectDB";

connectDB();

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); 

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/customer", customerRouter);
app.use("/api/product", productRouter);
app.use("/api/sale", salesRouter);




app.use(errorHandler);

export default app;
