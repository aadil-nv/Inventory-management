import { Response, NextFunction } from "express";
import { User } from "../models/user.scheema";
import { MESSAGES } from "../utils/constants";
import { AuthRequest } from "../utils/interface"; 
import { HttpStatusCode } from "../utils/enums";

export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: MESSAGES.UNAUTHORIZED });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ message: MESSAGES.USER_NOT_FOUND });
    }

    res.status(HttpStatusCode.OK).json({ message: MESSAGES.PROFILE_FETCHED, user });
  } catch (error) {
    next(error); 
  }
};
