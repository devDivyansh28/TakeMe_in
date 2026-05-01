import Joi from "joi";

import BaseDto from "../../../common/dto/base.dto.js";

class ClientLoginDto extends BaseDto {
  static schema = Joi.object({
    client_mail: Joi.string().email().lowercase().required(),
    client_secret: Joi.string()
      .min(8)
      .pattern(/(?=.*[A-Z])(?=.*\d)/)
      .message(
        "Secret must contain at least one uppercase letter and one digit",
      )
      .required(),
  });
}

export default ClientLoginDto;
