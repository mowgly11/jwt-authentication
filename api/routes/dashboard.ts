import type { Request, Response, NextFunction } from 'express';
import { checkAuthenticated } from '../middleware/auth_middleware.ts';

export default {
  methods: ["get"],
  endpoint: "/dashboard",
  middleware: checkAuthenticated,
  Get: async function (req: Request, res: Response, next: NextFunction) {
    res.render("dashboard.ejs", { data: req.user });
  }
};