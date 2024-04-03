const express = require("express");
const bodyParser = require("body-parser");
const path = require("path")
const mysql = require("mysql");
const md5 = require("md5");
const ValidateMiddle = require("./middleware/middleware");
const AuthMiddle = require("./middleware/authware")
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const router = require('./route')
const app = express();
require('dotenv').config();
const PORT = process.env.port;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
// app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use(router);

app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}/`);
});