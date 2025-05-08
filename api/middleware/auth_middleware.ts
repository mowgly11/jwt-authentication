import type { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Authentication } from "../../database/methods";
import blacklist_schema from "../../database/schemas/blacklist_schema";

async function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.auth;
    if (!token) return res.status(403).redirect("/login");

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET!);
        const blacklistedToken = await blacklist_schema.findOne({ token });
        if (blacklistedToken) {
            res.clearCookie("auth");
            return res.redirect("/login?err=403");
        }

        const userIsValid = await Authentication.findUserById((user as jwt.JwtPayload).user);
        if (!userIsValid) {
            res.clearCookie("auth");
            return res.redirect("/login");
        }

        req.user = userIsValid;
        next();
    } catch (err) {
        res.status(500).send("Server Error, please contact us if this issue persists.");
    }
}


export {
    checkAuthenticated
};