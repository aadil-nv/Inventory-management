import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";
import { registerValidation, loginValidation } from "../middlewares/authValidators";
import { validateRequest } from "../middlewares/validateRequest";

const authRouter = Router();

authRouter.post("/register", registerValidation, validateRequest, registerUser);
authRouter.post("/login", loginValidation, validateRequest, loginUser);

export default authRouter;
