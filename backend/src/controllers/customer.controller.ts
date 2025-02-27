import { Response, NextFunction } from "express";
import { Customer } from "../models/customer.schema";
import { MESSAGES } from "../utils/constants";
import { HttpStatusCode } from "../utils/enums";
import { AuthRequest } from "../utils/interface";
import { validationResult } from "express-validator";

export const addNewCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ errors: errors.array() });
    }

    const { name, email, mobileNumber, address } = req.body;
    const userId = req.user?.id;
    

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(HttpStatusCode.CONFLICT).json({ message: MESSAGES.CUSTOMER_ALREADY_EXISTS });
    }

    const newCustomer = new Customer({userId, name, email, mobileNumber, address });
    await newCustomer.save();

    return res.status(HttpStatusCode.CREATED).json({
      message: MESSAGES.CUSTOMER_CREATED,
      customer: newCustomer,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCustomers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "User not authenticated" });
    }

    const customers = await Customer.find({ userId }); // Filter by userId
    return res.status(HttpStatusCode.OK).json({ customers });
  } catch (error) {
    next(error);
  }
};


export const getCustomerById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ message: MESSAGES.CUSTOMER_NOT_FOUND });
    }

    return res.status(HttpStatusCode.OK).json({ customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedCustomer) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ message: MESSAGES.CUSTOMER_NOT_FOUND });
    }

    return res.status(HttpStatusCode.OK).json({
      message: MESSAGES.CUSTOMER_UPDATED,
      customer: updatedCustomer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deletedCustomer = await Customer.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ message: MESSAGES.CUSTOMER_NOT_FOUND });
    }

    return res.status(HttpStatusCode.OK).json({ message: MESSAGES.CUSTOMER_DELETED });
  } catch (error) {
    next(error);
  }
};
