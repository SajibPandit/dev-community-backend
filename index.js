const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected"))
  .catch(() => console.log("Error Occured"));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

//middlewares
app.use(express.json());

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`listening on port ${port}`));
