import { Router } from "express";
import { addNewProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/product.controller";
import {authMiddleware} from "../middlewares/authMiddleware";
import { productValidation } from "../middlewares/authValidators";

export const productRouter = Router();

productRouter.post("/add-product", authMiddleware,productValidation, addNewProduct);
productRouter.get("/list-products", authMiddleware, getAllProducts);
productRouter.get("/product/:id",authMiddleware, getProductById);
productRouter.put("/update-product/:id", authMiddleware, productValidation, updateProduct);
productRouter.delete("/delete-product/:id", authMiddleware, deleteProduct);






