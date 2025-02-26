import { Response, NextFunction } from "express";
import { Sale } from "../models/sales.scheema";
import { Product } from "../models/product.schema";
import { MESSAGES } from "../utils/constants";
import { HttpStatusCode } from "../utils/enums";
import { AuthRequest } from "../utils/interface";
import { validationResult } from "express-validator";

export const addNewSale = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({ errors: errors.array() });
        }

        const { products, customerId, paymentMethod ,totalPrice} = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Products array is required" });
        }

        const saleProducts = [];

        for (const item of products) {
            const { productId, quantity } = item;

            const existingProduct = await Product.findById(productId);
            if (!existingProduct) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: `Product not found: ${productId}` });
            }

            if (existingProduct.quantity < quantity) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: `Insufficient stock for product: ${existingProduct.productName}` });
            }

            // Deduct stock
            existingProduct.quantity -= quantity;
            await existingProduct.save();

            saleProducts.push({ productId, quantity });
        }
       
       
        const newSale = new Sale({
            products: saleProducts,
            customerId,
            paymentMethod,
            totalPrice,
        });

        await newSale.save();

        return res.status(HttpStatusCode.CREATED).json({
            message: MESSAGES.SALE_CREATED,
            sale: newSale,
        });
    } catch (error) {
        next(error);
    }
};

  
export const getAllSales = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sales = await Sale.find().populate("products.productId customerId");
    return res.status(HttpStatusCode.OK).json({ sales });
  } catch (error) {
    next(error);
  }
};

export const getSaleById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id).populate("products.productId customerId");

    if (!sale) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ message: MESSAGES.SALE_NOT_FOUND });
    }

    return res.status(HttpStatusCode.OK).json({ sale });
  } catch (error) {
    next(error);
  }
};

export const updateSale = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({ errors: errors.array() });
      }
  
      const { id } = req.params;
      const { products, paymentMethod, totalPrice } = req.body;
  
      // Find the existing sale
      const existingSale = await Sale.findById(id);
      if (!existingSale) {
        return res.status(HttpStatusCode.NOT_FOUND).json({ message: MESSAGES.SALE_NOT_FOUND });
      }
  
      // Restore stock for old products
      for (const oldProduct of existingSale.products) {
        const product = await Product.findById(oldProduct.productId);
        if (product) {
          product.quantity += oldProduct.quantity;
          await product.save();
        }
      }
  
      // Update products and adjust stock
      for (const newProductData of products) {
        const product = await Product.findById(newProductData.productId);
        if (!product) {
          return res.status(HttpStatusCode.NOT_FOUND).json({ message: MESSAGES.PRODUCT_NOT_FOUND });
        }
  
        if (product.quantity < newProductData.quantity) {
          return res.status(HttpStatusCode.BAD_REQUEST).json({ message: MESSAGES.INSUFFICIENT_STOCK });
        }
  
        product.quantity -= newProductData.quantity;
        await product.save();
      }
  
      // Update sale details
      existingSale.products = products;
      existingSale.paymentMethod = paymentMethod || existingSale.paymentMethod;
      existingSale.totalPrice = totalPrice || existingSale.totalPrice;
      await existingSale.save();
  
      return res.status(HttpStatusCode.OK).json({
        message: MESSAGES.SALE_UPDATED,
        sale: existingSale,
      });
    } catch (error) {
      next(error);
    }
  };
  
  
  
export const deleteSale = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deletedSale = await Sale.findByIdAndDelete(id);

    if (!deletedSale) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ message: MESSAGES.SALE_NOT_FOUND });
    }

    return res.status(HttpStatusCode.OK).json({ message: MESSAGES.SALE_DELETED });
  } catch (error) {
    next(error);
  }
};
