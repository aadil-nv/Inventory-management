import express from "express";
import cors from "cors";
import dotenv from "dotenv";
       dotenv.config();
import cookieParser from "cookie-parser";
import logger from "./middlewares/logger";
import corsOptions from "./config/corsOptions"; 

import { errorHandler } from "./middlewares/errorHandler";
import { authRouter } from "./routes/auth.routes";
import { userRouter } from "./routes/user.routes";
import { customerRouter } from "./routes/customer.routes";
import { productRouter } from "./routes/product.routes";
import { salesRouter } from "./routes/sales.routes";
import { connectDB } from "./config/connectDB";
import { dashboardRouter } from "./routes/dashboard.routes";

connectDB();

const app = express();

app.use(cors(corsOptions)); 
app.use(express.json());
app.use(cookieParser());
app.use(logger);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/customer", customerRouter);
app.use("/api/product", productRouter);
app.use("/api/sale", salesRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(errorHandler);

export default app;
