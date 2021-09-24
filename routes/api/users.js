const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

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
  const { name, email, password } = req.body;
  User.findOne({ email }).then((user) => {
    if (user) {
      return res.status(400).json({
        email: "Email Already Exists",
      });
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
  const { email, password } = req.body;
  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(404).json({
        email: "User not found",
      });
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
                console.log(token)
              if (token) {
                res.status(200).json({
                  success: true,
                  token : `Bearer ${token}`
                });
              } else {
                res.status(400).json({
                  message: "Error occurred in signing",
                });
              }
            }
          );
        } else {
          res.status(400).json({
            message: "Password Incorrect",
          });
        }
      });
    }
  });
});

module.exports = router;
