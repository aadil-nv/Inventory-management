import { Router } from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import { deleteSale, getAllSales, getSaleById, updateSale,addNewSale } from "../controllers/sales.controller";
import { saleValidation } from "../middlewares/authValidators";

export const salesRouter = Router();

salesRouter.post("/add-sale",saleValidation,addNewSale );
salesRouter.get("/list-sales", getAllSales);
salesRouter.get("/sale-details/:id", getSaleById);
salesRouter.put("/update-sale/:id",saleValidation, updateSale);
salesRouter.delete("/delete-sale/:id", authMiddleware, deleteSale);


