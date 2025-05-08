import type { Request, Response, NextFunction } from 'express';
import blacklist_schema from '../../database/schemas/blacklist_schema.ts';
import jwt from "jsonwebtoken";

export default {
    methods: ["get"],
    endpoint: "/logout",
    middleware: false,
    Get: async function (req: Request, res: Response, next: NextFunction) {
        const cookie = req.cookies?.auth;

        if (cookie) {
            try {
                jwt.verify(cookie, process.env.JWT_SECRET!, async (err: any, user: any) => {
                    if (err) return;

                    await blacklist_schema.create({
                        token: cookie,
                        expDate: user.exp
                    }).then(async d => await d.save());
                });
            } catch (err) {
                return res.status(500).send("Internal Server Error.");
            }
        }
        res.clearCookie("auth");
        res.redirect("/login");
    }
};