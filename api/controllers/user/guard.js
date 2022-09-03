const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const AccessControl = require("../../models/accessControl");
const mongoose = require("mongoose");
const { password_regex, email_regex } = require("../../constants/expressions");
const { objectCleaner } = require("../factory/operations");
const { Cypher } = require("@zheeno/mnemonic-cypher");
const { DatabaseStub } = require("../factory/DatabaseStub");

exports.user_sign_up = (req, res, next) => {
  try {
    // validation
    if (!email_regex.test(req.body.email)) throw new Error("An email must be specified");
    if (!req.body.firstName) throw new Error("A first name must be specified");
    if (!req.body.lastName) throw new Error("A last name must be specified");
    if (!req.body.phone) throw new Error("A phone must be specified");
    if (!req.body.dob) throw new Error("A dob must be specified");
    if (!req.body.password) throw new Error("A password must be specified");
    // check if user exists
    User.find({ email: req.body.email })
      .exec()
      .then((user) => {
        if (_.size(user) >= 1) {
          return res.status(409).json({
            message: "A user already exists with the same email",
          });
        } else {
          // create user account
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err,
              });
            } else {
              const body = req.body;
              const user = new User({
                _id: new mongoose.Types.ObjectId(),
                ...body,
                password: hash,
              });
              user
                .save()
                .then((result) => {
                  return res.status(200).json({
                    message: "User created successfully",
                  });
                })
                .catch((error) => {
                  console.error(error);
                  return res.status(500).json({ message: error });
                });
            }
          });
        }
      });
  } catch (_error) {
    console.error(_error);
    return res.status(500).json({ message: _error.message });
  }
};

exports.user_login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then(async (user) => {
      if (!user)
        return res
          .status(401)
          .json({ message: "Auth failed: Invalid username / password" });
      // validate password
      bcrypt.compare(req.body.password, user.password, async (err, result) => {
        try {
          if (err || !result) {
            return res.status(401).json({
              message: "Auth failed: Invalid username / password",
            });
          }
          if (result) {
            // remove password field from user
            user = objectCleaner({ ...user._doc, password: null });
            const cypher = new Cypher()
            const { mnemonics } = cypher.genMnemonics();
            const JWTContent = {
              seedPhrase: mnemonics,
              username: user.username,
              id: user._id,
            };
            const response = {
              status: 200,
              message: "Auth Successful",
              seedPhrase: mnemonics,
              user: user,
            }
            // check if the user has any access control config
            const stub = new DatabaseStub(AccessControl)
            const access = await stub.read(req, {
              user: user?._id
            })
            if (!_.isEmpty(access?.data)) {
              JWTContent["permissions"] = access?.data[0]?.permissions
              response["permissions"] = access?.data[0]?.permissions
            }
            response["token"] = jwt.sign(JWTContent, process.env.JWT_KEY, {
              expiresIn: "100Y",
            });
            return res.status(200).json(response);
          }
        } catch (error) {
          return res.status(500).json({ message: error.message });
        }
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ message: error.message });
    });
};
