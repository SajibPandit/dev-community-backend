const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const router = express.Router();

//Load input validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

const User = require("../../models/User");

//@route  Get api/posts/test
//@desc   Test user route
//@access Public
router.get("/test", (req, res) => {
  res.json({
    message: "User works",
  });
});

//@route  POST api/users/register
//@desc   Register User
//@access Public
router.post("/register", (req, res) => {
  const {errors , isValid} = validateRegisterInput(req.body)
  //check validation
  if(!isValid){
    return res.status(400).json(errors)
  }
  const { name, email, password } = req.body;
  User.findOne({ email }).then((user) => {
    if (user) {
      errors.email = 'Email Already Exists'
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(email, {
        s: 200, //Size
        r: "pg", //Rating
        d: "mm", //Default
      });

      const newUser = new User({
        name,
        email,
        password,
        avatar,
      });

      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
          if (err) {
            return res.status(400).json({
              password: "Password hashed process failed",
            });
          }
          newUser.password = hash;
          newUser
            .save()
            .then((user) => {
              res.status(201).json({
                message: "User created successfully",
                user,
              });
            })
            .catch((err) => {
              res.status(500).json({
                message: "Create user request failed",
                err,
              });
            });
        });
      });
    }
  });
});

//@route  POST api/users/login
//@desc   Login User /Returning JWT Token
//@access Public
router.post("/login", (req, res) => {
  
  const {errors , isValid} = validateLoginInput(req.body)
  //check validation
  if(!isValid){
    return res.status(400).json(errors)
  }
  const { email, password } = req.body;
  User.findOne({ email }).then((user) => {
    if (!user) {
      errors.email = 'User not found'
      return res.status(404).json(errors);
    } else {
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          //User Matched
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
          }; //Create JWT Payload

          //Sign Token
          jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
            (err, token) => {
              console.log(token);
              if (token) {
                res.status(200).json({
                  success: true,
                  token: `Bearer ${token}`,
                });
              } else {
                res.status(400).json({
                  message: "Error occurred in signing",
                });
              }
            }
          );
        } else {
          errors.password = 'Password is incorrect'
          res.status(400).json(errors);
        }
      });
    }
  });
});

//@route  Get api/users/current
//@desc   Return Current User
//@access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { id, name, email, avatar } = req.user;
    return res.status(200).json({
      id,
      name,
      email,
      avatar,
    });
  }
);

module.exports = router;
