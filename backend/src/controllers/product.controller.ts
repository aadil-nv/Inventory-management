import { Response, NextFunction } from "express";
import { Product } from "../models/productSchema";
import { MESSAGES } from "../utils/constants";
import { AuthRequest } from "../utils/interface";
import { HttpStatusCode } from "../utils/enums";
import { validationResult } from "express-validator";

export const addNewProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ errors: errors.array() });
    }

    const { productName, description, quantity, price } = req.body;

    const existingProduct = await Product.findOne({ productName });
    if (existingProduct) {
      return res.status(HttpStatusCode.CONFLICT).json({ message: MESSAGES.PRODUCT_ALREADY_EXISTS });
    }

    const newProduct = new Product({ productName, description, quantity, price });
    await newProduct.save();

    return res.status(HttpStatusCode.CREATED).json({
      message: MESSAGES.PRODUCT_CREATED,
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find();
    return res.status(HttpStatusCode.OK).json({ products });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ message: MESSAGES.PRODUCT_NOT_FOUND });
    }

    return res.status(HttpStatusCode.OK).json({ product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { productName, description, quantity, price } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { productName, description, quantity, price },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ message: MESSAGES.PRODUCT_NOT_FOUND });
    }

    return res.status(HttpStatusCode.OK).json({
      message: MESSAGES.PRODUCT_UPDATED,
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ message: MESSAGES.PRODUCT_NOT_FOUND });
    }

    return res.status(HttpStatusCode.OK).json({
      message: MESSAGES.PRODUCT_DELETED,
      product: deletedProduct,
    });
  } catch (error) {
    next(error);
  }
};
