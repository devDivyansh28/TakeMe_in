import { Router } from "express";

import * as controller from "./auth.controller.js";

import validate from "../../common/middleware/validate.middleware.js";

import RegisterDto from "./dto/register.dto.js";

import LoginDto  from "./dto/login.dto.js"

import { authenticate } from "./auth.middleware.js";

const router = Router();

router.post("/takemein/register", validate(RegisterDto), controller.register);
router.post("/takemein/login",validate(LoginDto) , controller.login)

// router.post("/login",validate(LoginDto),controller.login)

router.get("/takemein/me",authenticate  ,controller.getMe);

// router.post("/logout",authenticate,controller.logout)

// router.post("/getMe",authenticate,controller.getMe)
// // router.get("/verify-email/:token",controller.getMe);

router.get('/health',(req,res)=>{
    return res.status(200).json({health : "ok"})
})



router.get('/.well-known/openid-configuration', controller.oidc)
router.get('/oidc/takeit',controller.takeit)

router.post('/oidc/token',controller.handleToken),

router.post('/oidc/userinfo',controller.userinfo)

router.get('/oidc/getPublicToken',controller.getPublicToken)


export default router;
