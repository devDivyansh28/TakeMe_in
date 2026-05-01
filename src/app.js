import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "url";
import session from "express-session"
import "dotenv/config"

const app = express(); 

import router from "./modules/auth/auth.routes.js";
import ApiError from "./common/utils/api_error.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "oidc.sid", 
    secret: "takeMeIn123", 
    resave: true, 
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


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    message,
  });
});

export default app;


