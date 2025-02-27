import { Router } from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import { getDashboardData } from "../controllers/dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.get("/get-dashboard",authMiddleware, getDashboardData);

