import type { Request, Response, NextFunction } from 'express';

export default {
    methods: ["get"],
    endpoint: "/login",
    middleware: false,
    Get: async function (req: Request, res: Response, next: NextFunction) {
        res.render("login.ejs");
    }
};