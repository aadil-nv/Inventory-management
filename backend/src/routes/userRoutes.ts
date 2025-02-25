import { Router } from "express";
import { getUserProfile } from "../controllers/user.controller";
import authMiddleware from "../middlewares/authMiddleware";

const userRouter = Router();

userRouter.get("/profile", authMiddleware, getUserProfile);

export default userRouter;
