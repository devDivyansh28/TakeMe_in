import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "url";
import session from "express-session"
import "dotenv/config"

const app = express(); // This file is important if in future we want to shift from express to fastify,bun,elysia,hono

import router from "./modules/auth/auth.routes.js";
import ApiError from "./common/utils/api_error.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "oidc.sid", 
    secret: "takeMeIn123", 
    resave: false, 
    saveUninitialized: false,
    cookie: {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 10, 
    },
  }),
);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/',router);

app.all("{*path}", (req, res) => {
  throw ApiError.notFound(`Route ${req.originalUrl} not found`);
});

export default app;


