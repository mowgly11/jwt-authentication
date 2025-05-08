"use strict";

import express, { type Request, type Response, type NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import passport from 'passport';
import initializePassport from "./passport.ts";
import MongooseInit from "../database/connection.ts";
import blacklist_schema from '../database/schemas/blacklist_schema.ts';

new MongooseInit(process.env.MONGODB_URI!).connect();

setInterval(async () => {
    await blacklist_schema.deleteMany({ expDate: { $lt: new Date() } })
}, 1000 * 60 * 60 * 24);

initializePassport();

const app = express();

app.disable('etag');
app.disable('x-powered-by');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../view"));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
    }
}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(passport.initialize());


const methodMap = new Map([
    ["get", { method: "get", callback: "Get" }],
    ["post", { method: "post", callback: "Post" }],
    ["delete", { method: "delete", callback: "Delete" }],
    ["patch", { method: "patch", callback: "Patch" }],
    ["put", { method: "put", callback: "Put" }],
]);

const endpointsPath = path.join(__dirname, "routes");

const readEndpointsDirectory = async (directoryPath: string, app: any, methodMap: any) => {
    const files = fs.readdirSync(directoryPath);

    await Promise.all(files.map(async (file) => {
        const filePath = path.join(directoryPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile() && file.endsWith(".ts")) {
            const module = await import(`file://${filePath}`);
            const { endpoint, methods, middleware } = module.default;

            methods.forEach((method: string) => {
                const { callback, method: httpMethod } = methodMap.get(method);
                if (typeof middleware === 'function') app[httpMethod](endpoint, middleware, module.default[callback]);
                else app[httpMethod](endpoint, module.default[callback]);
                console.log("Loaded " + endpoint)
            });

        }
    }));
};

readEndpointsDirectory(endpointsPath, app, methodMap).then(() => {
    app.listen(process.env.PORT! || 3000, () => console.log("listening on port " + process.env.port!));
});