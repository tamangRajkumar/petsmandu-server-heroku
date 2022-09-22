import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { readdirSync } from "fs";
import compression from "compression";

const app = express();
const morgan = require("morgan");
require("dotenv").config();

// Database connection
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log("Database connection error");
  });

// Middleware
app.use(
  compression({
    level: 9,
    threshold: 0,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: "true" }));

// Morgan
app.use(morgan("dev"));

// Auto loading Routes
readdirSync("./routes").map((r) => {
  app.use("/api", require(`./routes/${r}`));
});

// tell Heroku Server to serve static files
if (process.env.Node_ENV == "production") {
  app.use(express.static("client/build"));
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(dirname, "client", "build", "index.html"));
  });
}

// Start server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
