import { Router } from "express";

import * as controller from "./auth.controller.js";

import validate from "../../common/middleware/validate.middleware.js";

import RegisterDto from "./dto/register.dto.js";

import LoginDto  from "./dto/login.dto.js"
import ClientLoginDto from "./dto/client.login.dto.js";
import ClientDto from "./dto/client.dto.js";

import { authenticate , authenticateClient} from "./auth.middleware.js";

const router = Router();

router.get('/health',(req,res)=>{
    return res.status(200).json({health : "ok"})
})


router.get("/takemein/register", (req, res) => {
    return res.sendFile(process.cwd() + '/public/login.html');
});

router.get("/takemein/login", (req, res) => {
    return res.sendFile(process.cwd() + '/public/login.html');
});

router.get('/oidc/takeit',authenticateClient,(req, res) => {
    return res.sendFile(process.cwd() + '/public/login.html')}
);

router.post("/takemein/oidc/register", validate(RegisterDto), controller.register);

router.post("/takemein/oidc/login",validate(LoginDto) , controller.login)


router.post('/takemein/registerclient',validate(ClientDto) , controller.registerClient);
router.post('/takemein/clients/profile',validate(ClientLoginDto) , controller.clientProfile)





router.get('/.well-known/openid-configuration', controller.oidc)



router.post('/oidc/token',controller.handleToken)

router.get('/oidc/userinfo', authenticate, controller.userinfo)

router.get('/oidc/getPublicToken',controller.getPublicToken)




export default router;
