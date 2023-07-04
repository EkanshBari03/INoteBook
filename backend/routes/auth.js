const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ResultWithContext } = require("express-validator/src/chain");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "Il0vem@nu";

//ROUTE 1 create user using PORT "/api/auth/createuser" NO login require
router.post(
  "/createuser",
  [
    body("name", "Enter valid name ").isLength({ min: 3 }),
    body("email", "Enter valid email ").isEmail(),
    body("password", "Enter valid password ").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    // if there are errors , return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }
    // check whether the user with this email exist
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "Sorry this user with the email already exist" });
      }
      // create  a new user
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
 
      success = true; 
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// ROUTE 2 Authenticate a user using PORT "/api/auth/login" NO login require
router.post(
  "/login",
  [
    body("email", "Enter valid email ").isEmail(),
    body("password", "Password can not be blank ").exists(),
  ],
  async (req, res) => {
    // if there are errors , return Bad request and the errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({success, error: "Please login with correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({ success,error: "Please login with correct credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success ,authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);
// ROUTE 2 Get user details using PORT "/api/auth/getuser"  login require
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});
module.exports = router;
