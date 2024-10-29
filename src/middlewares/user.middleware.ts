import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

const userAuthMiddleware = (req: any, res: any, next: NextFunction) => {
    const authHeader = req.headers["authorization"] ?? "";
    console.log(authHeader);
    

    if (!authHeader) {
        return res.status(400).json({success: false, message: "No auth header available"})
    }

    try {
        const decode = jwt.verify(authHeader, `${process.env.JWT_TOKEN_SESSION_SECRET}`)
        //@ts-ignore
        const user = decode.userId
        //@ts-ignore
        req.userId = user
        return next()
    } catch (error) {
        return res.status(400).json({success: false, message: "Login first"})
    }
}
export {userAuthMiddleware}