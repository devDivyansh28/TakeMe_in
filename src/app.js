import express from "express";
import cookieParser from "cookie-parser";


const app = express(); // This file is important if in future we want to shift from express to fastify,bun,elysia,hono

import router from "./modules/auth/auth.routes.js";
import ApiError from "./common/utils/api_error.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.get('/health',(req,res)=>{
//   return res.status(200).json({healthy: true})
// })

app.use('/',router);

app.all("{*path}", (req, res) => {
  throw ApiError.notFound(`Route ${req.originalUrl} not found`);
});

export default app;


