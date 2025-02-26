import { Router } from "express";
import { getUserProfile } from "../controllers/user.controller";
import {authMiddleware} from "../middlewares/authMiddleware";

export const userRouter = Router();

userRouter.get("/profile", authMiddleware, getUserProfile);

