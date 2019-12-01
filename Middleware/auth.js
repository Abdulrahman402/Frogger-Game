const jwt = require("jsonwebtoken");
const keys = require("../Config/keys");

module.exports = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied");
  try {
    const decoded = jwt.verify(token, keys.tokenSecretKey);
    req.user = decoded;

    next();
  } catch (e) {
    res.status(401).send("Authentication failed");
  }
};
