import jwt from "jsonwebtoken";
import usersModel from "../models/users.model.js";

export async function authenticateToken(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
        return res.status(401).json({ message: "Please sign in to continue." });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await usersModel.findById(payload.id);
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "This account is unavailable. Please contact the clinic." });
        }
        req.user = user;
        return next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Your session has expired. Please sign in again." });
        }
        return next(error);
    }
}

export function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            return res.status(403).json({ message: "You do not have permission to access this resource." });
        }
        return next();
    };
}
