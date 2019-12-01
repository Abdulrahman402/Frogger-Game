const mongoose = require("mongoose");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const keys = require("../Config/keys");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  verefied: {
    type: Boolean,
    default: false
  },
  currScore: {
    type: Number
  },
  highestScore: Number,
  char: String
});

userSchema.methods.generateAuthToken = async function() {
  const token = jwt.sign(
    { _id: this._id, verefied: this.verefied },
    keys.tokenSecretKey,
    {
      expiresIn: "365 days"
    }
  );

  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    name: joi.string().required(),
    email: joi
      .string()
      .required()
      .email(),
    password: joi.string().required()
  };
  return joi.validate(user, schema);
}

function updateUser(user) {
  const schema = {
    name: joi.string(),
    password: joi.string()
  };
  return joi.validate(user, schema);
}

module.exports.User = User;
module.exports.validateUser = validateUser;
module.exports.updateUser = updateUser;
