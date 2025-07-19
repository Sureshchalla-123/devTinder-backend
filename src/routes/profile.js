const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");

const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfuly`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { password, conformPassword } = req.body;

    if (!password || !conformPassword) {
      throw new Error("Please enter a valid password");
    } else if (password !== conformPassword) {
      throw new Error("Passwords do not match");
    }

    const loggedInUser = req.user;
    const passwordHash = await bcrypt.hash(password, 10);
    loggedInUser.password = passwordHash;
    await loggedInUser.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = profileRouter;
