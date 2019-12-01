const express = require("express");
const { validateUser, updateUser, User } = require("../Models/User");
const auth = require("../Middleware/auth");
const verefied = require("../Middleware/verefied");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const keys = require("../Config/keys");
sgMail.setApiKey(keys.sgAPIKey);

router.get("/", auth, verefied, async (req, res) => {
  const user = await User.find();
  res.send(user);
});

router.post("/signUp", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User(_.pick(req.body, ["name", "email", "password"]));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const token = await user.generateAuthToken();

  await user.save();

  res.header("x-auth-token", token).send(_.pick(user, "email", "name"));
});

router.post("/sendMail", auth, async (req, res) => {
  const user = await User.findOne(req.params.id);

  sgMail.send({
    to: user.email,
    from: "abduwemoh@gmail.com",
    subject: "Validation Email",
    text:
      "click link below to verify your account http://localhost:1000/api/users/verify"
  });
  res.send("Mail sent");
});

router.put("/verify", auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { verefied: true } },
    { new: true }
  );
  const token = await user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send("Congratulations, your account is verified");
});

router.put("/name", auth, async (req, res) => {
  const { error } = updateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { name: req.body.name } },
    { new: true }
  );

  if (!user) return res.status(400).send("The user with given ID not found");

  res.send(_.pick(user, "email", "name"));
});

router.put("/password", auth, async (req, res) => {
  const { error } = updateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { password: req.body.password },
    { new: true }
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  res.send("Password changed successfully");
});

router.get("/score", auth, verefied, async (req, res) => {
  const user = await User.findOne(req.user._id);
  res.send(user.currScore);
});

router.get("/highScore", auth, verefied, async (req, res) => {
  const user = await User.findOne(req.user._id);
  res.send(user.highestScore);
});

router.put("/updateScore", auth, verefied, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id);

  if (user.currScore > user.highestScore) {
    user.highestScore = user.currScore;
  }
  res.send(user.highestScore);
});

module.exports = router;
