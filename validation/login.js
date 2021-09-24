const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (!validator.isEmail(data.email)) {
    errors.email = "Email is not valid";
  }
  if (validator.isEmpty(data.email)) {
    errors.email = "Email must not be empty";
  }
  if (validator.isEmpty(data.password)) {
    errors.password = "Password must not be empty";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
