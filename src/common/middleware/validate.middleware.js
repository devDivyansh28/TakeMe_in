import ApiError from "../utils/api_error.js";

const validate = (Dtoclass) => {
  return (req, res, next) => {
    const { errors, value } = Dtoclass.validate(req.body);
    if (errors) {
      throw ApiError.badRequest(errors.join("\n"));
    }
    req.body = value; 
    next();
  };
};

export default validate;
