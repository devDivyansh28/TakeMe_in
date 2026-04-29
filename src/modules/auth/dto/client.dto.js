import Joi from "joi";

import BaseDto from "../../../common/dto/base.dto.js";

class ClientDto extends BaseDto {
    static schema = Joi.object({
        project_Name : Joi.string()
             .min(3)
             .max(100)
             .trim()
             .lowercase()
             .required(),
        client_url : Joi.string()
                 .uri()
                 .required(),

        support_mail : Joi.string().email().lowercase().required(),
        redirect_url : Joi.string().uri().required(),

        client_secret : Joi.string()
              .min(8)
              .pattern(/(?=.*[A-Z])(?=.*\d)/)
              .message(
                "Secret must contain at least one uppercase letter and one digit",
              )
              .required()
    })
}

export default ClientDto;
