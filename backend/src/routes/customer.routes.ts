import { Router } from "express";
import { addNewCustomer, deleteCustomer, getAllCustomers, getCustomerById, updateCustomer } from "../controllers/customer.controller";
import {authMiddleware} from "../middlewares/authMiddleware";
import { customerValidation} from "../middlewares/authValidators"

export const customerRouter = Router();

customerRouter.post("/add-customer", authMiddleware,customerValidation, addNewCustomer);
customerRouter.get("/list-customers", authMiddleware, getAllCustomers);
customerRouter.get("/customer-details/:id", authMiddleware, getCustomerById);
customerRouter.put("/update-customer/:id", authMiddleware,customerValidation, updateCustomer);
customerRouter.delete("/delete-customer/:id", deleteCustomer);

