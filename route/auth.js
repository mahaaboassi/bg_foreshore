const express = require("express");
const { SignIn, SignUp } = require("../controller/user");

const router = express.Router();

router.post("/signin",SignIn)
router.post("/signup",SignUp)

module.exports = {router};