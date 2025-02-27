import { Router } from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import { deleteSale, getAllSales, getSaleById, updateSale,addNewSale ,sendSalesReport} from "../controllers/sales.controller";
import { saleValidation } from "../middlewares/authValidators";

export const salesRouter = Router();

salesRouter.post("/add-sale", authMiddleware,addNewSale );
salesRouter.get("/list-sales", authMiddleware,getAllSales);
salesRouter.get("/sale-details/:id",authMiddleware, getSaleById);
salesRouter.put("/update-sale/:id",saleValidation, updateSale);
salesRouter.delete("/delete-sale/:id", authMiddleware, deleteSale);
salesRouter.post('/send-sales-details', authMiddleware, sendSalesReport);


