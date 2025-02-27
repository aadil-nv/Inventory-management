import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Sale } from "../models/sales.scheema";
import { Product } from "../models/product.schema";
import { Customer } from "../models/customer.schema";
import { AuthRequest } from "../utils/interface";
import { HttpStatusCode } from "../utils/enums";

export const getDashboardData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "User not authenticated" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id); // Convert to ObjectId
    console.log("User ID from dashboard:", userId);

    const totalCustomers = await Customer.countDocuments({ userId });
    const totalSales = await Sale.countDocuments({ userId });
    const totalProducts = await Product.countDocuments({ userId });

    // Total Revenue
    const totalRevenueData = await Sale.aggregate([
      { $match: { userId } }, 
      { $group: { _id: null, total: { $sum: { $toDouble: "$totalPrice" } } } } // Ensure it's summed as Number
    ]);

    console.log("Total Revenue Data:", totalRevenueData);
    const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;

    // Average Order Value (Total Revenue / Total Sales)
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Monthly Sales Report
    const monthlySales = await Sale.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          totalSales: { $sum: { $toDouble: "$totalPrice" } },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(HttpStatusCode.OK).json({
      message: "Dashboard data fetched successfully",
      data: {
        totalCustomers,
        totalSales,
        totalProducts,
        totalRevenue,
        averageOrderValue,
        monthlySales
      }
    });

  } catch (error) {
    next(error);
  }
};
