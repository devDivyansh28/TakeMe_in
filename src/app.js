import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";


const app = express(); // This file is important if in future we want to shift from express to fastify,bun,elysia,hono

import router from "./modules/auth/auth.routes.js";
import ApiError from "./common/utils/api_error.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));


app.use('/',router);

app.all("{*path}", (req, res) => {
  throw ApiError.notFound(`Route ${req.originalUrl} not found`);
});

export default app;


