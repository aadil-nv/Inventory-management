import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { MESSAGES } from "../utils/constants";
import { User } from "../models/userScheema";
import { HttpStatusCode } from "../utils/enums";
import { generateAccessToken, generateRefreshToken ,verifyRefreshToken } from "../utils/jwt";


export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({ errors: errors.array() });
      }
  
      const { name, email, password } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({ message: MESSAGES.USER_ALREADY_EXISTS });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword }); // Added name field
      const user =await newUser.save();
  
      const accessToken = generateAccessToken({ id: newUser._id, email: newUser.email });
      const refreshToken = generateRefreshToken({ id: newUser._id, email: newUser.email });
  
      res.cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 15 * 60 * 1000 });
      res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
  
      res.status(HttpStatusCode.CREATED).json({ message: MESSAGES.USER_REGISTERED , user});
    } catch (error) {
      next(error);
    }
  };
  

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ message: MESSAGES.INVALID_CREDENTIALS });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ message: MESSAGES.INVALID_CREDENTIALS });
    }

    const accessToken = generateAccessToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id, email: user.email });

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 15 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(HttpStatusCode.OK).json({ message: MESSAGES.USER_LOGGED_IN ,name:user.name });
  } catch (error) {
    next(error);
  }
};


export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {  
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(HttpStatusCode.OK).json({ message: "User logged out successfully." });
  } catch (error) {
    next(error);
  }
}

export const setNewAccessToken =async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
    }
    
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
    }
    const accessToken = generateAccessToken({ id: decoded.id, email: decoded.email });
    res.cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 15 * 60 * 1000 });    
    res.status(HttpStatusCode.OK).json({ message: "Access token updated successfully." });
  } catch (error) {
    next(error);
  }
}