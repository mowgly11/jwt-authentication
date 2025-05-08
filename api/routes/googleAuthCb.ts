import type { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from "jsonwebtoken";
import blacklist_schema from '../../database/schemas/blacklist_schema.ts';

export default {
    methods: ["get"],
    endpoint: "/auth/google/cb",
    middleware: false,
    Get: function (req: Request, res: Response, next: NextFunction) {
        passport.authenticate('google', { failureRedirect: '/login', session: false }, async (err: Error, user: jwt.JwtPayload, info: any) => {
            if (err || !user) return res.redirect("/login");

            const previousToken = req.cookies?.auth;
            
            if (previousToken) {
                jwt.verify(previousToken, process.env.JWT_SECRET!, async (err: any, cookie: any) => {
                    if (err) return;
                    
                    await blacklist_schema.create({
                        token: previousToken,
                        expDate: cookie.exp
                    }).then(async doc => await doc.save());
                });
            }

            const token = jwt.sign({ user: user.id }, process.env.JWT_SECRET!, { expiresIn: 1000 * 60 * 60 * 24 });

            res.cookie("auth", token, { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24 });

            return res.redirect("/dashboard");
        })(req, res, next);
    }
};