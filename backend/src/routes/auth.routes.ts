import { Router } from "express";
import { registerUser, loginUser,logoutUser,setNewAccessToken } from "../controllers/auth.controller";
import { registerValidation, loginValidation } from "../middlewares/authValidators";
import { validateRequest } from "../middlewares/validateRequest";

export const authRouter = Router();

authRouter.post("/register", registerValidation, validateRequest, registerUser);
authRouter.post("/login", loginValidation, validateRequest, loginUser);
authRouter.post("/logout", validateRequest, logoutUser);
authRouter.post('/refresh-token', validateRequest, setNewAccessToken);

