import ApiError from "../utils/api_error.js";

const validate = (Dtoclass) => {
  return (req, res, next) => {
    const { errors, value } = Dtoclass.validate(req.body);
    if (errors) {
      throw ApiError.badRequest(errors.join(" "));
    }
    req.body = value; //***This is most imp step if you do not pass validated data next then what is the meaning of validation😀😀 This is the sanitized data from joi */
    next();
  };
};

export default validate;
