import { Router } from "express";

import * as controller from "./auth.controller.js";

import validate from "../../common/middleware/validate.middleware.js";

import RegisterDto from "./dto/register.dto.js";

import LoginDto  from "./dto/login.dto.js"

import ClientDto from "./dto/client.dto.js";

import { authenticate , authenticateClient} from "./auth.middleware.js";

const router = Router();

router.get('/health',(req,res)=>{
    return res.status(200).json({health : "ok"})
})
router.post("/takemein/register", validate(RegisterDto), controller.register);
router.post("/takemein/login",validate(LoginDto) , controller.login)

router.post('/takemein/registerclient',validate(ClientDto) , controller.registerClient);
// router.get("/takemein/me", authenticate, controller.getMe)

// router.post("/login",validate(LoginDto),controller.login)

// router.post("/logout",authenticate,controller.logout)

// router.post("/getMe",authenticate,controller.getMe)
// // router.get("/verify-email/:token",controller.getMe);




router.get('/.well-known/openid-configuration', controller.oidc)

router.get('/oidc/takeit',authenticateClient,controller.takeit)

router.post('/oidc/token',controller.handleToken)

router.get('/oidc/userinfo', authenticate, controller.userinfo)

router.get('/oidc/getPublicToken',controller.getPublicToken)

router.get('/takemein/takeit', (req,res) => {
    return res.sendFile(process.cwd() + '/public/dashboard.html');
})


export default router;
