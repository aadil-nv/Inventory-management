import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpStatusCode } from "../utils/enums";

interface UserPayload {
  id: string;
  email: string;
}

interface AuthRequest extends Request {
  user?: UserPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  console.log("token=11111111111111111111111111111 ",token);
  
  if (!token) {
    console.log("2222222222222222222222222222222222222");
    
    return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
  }

  try {
    console.log("ENV444444444444444444444 ",process.env.ACCESS_TOKEN_SECRET);
    
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as UserPayload;
    console.log("decoded ",decoded);
    
    if (!decoded) {
      console.log("@decoded calling 00000000 ",decoded);
      
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Next is calling =======>",error);
    
    return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Unauthorized" }); 
  }
};

