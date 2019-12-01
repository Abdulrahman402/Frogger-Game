const mongoose = require("mongoose");
const winston = require("winston");
const keys = require("./Config/keys");
const express = require("express");
const app = express();
const user = require("./Routes/users");
const auth = require("./Routes/auth");
const verefied = require("./Middleware/verefied");

mongoose
  .connect(keys.mongoURI)
  .then(() => console.log("Connected to Frogger DB"))
  .catch(err => console.log("Error while connecting DB", err));

const port = process.env.PORT || 1000;

const server = app.listen(port, () => {
  winston.info(`Listening on port ${port}`);
});

app.use(express.json());
app.use("/api/users", user);
app.use("/api/auth", auth);
app.use("/api/verefied", verefied);

module.exports = server;
