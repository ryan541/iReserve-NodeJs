if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();

//password encryption
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
//session creation
const session = require("express-session");
const mysql = require("mysql");

app.use(express.static(__dirname + "/public"));

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ireserve",
});

const initialisePassport = require("./passport-config");
initialisePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

const users = [];

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  });
  const { email, password } = req.body;
  let sql = `SELECT * FROM customers  where Email="${email}"`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    //res.send(result);
    if (result[0]) {
      if (bcrypt.compareSync(password, result[0].Password)) {
        return res.render("index", { name: result[0].Name });
      }
      return res
        .status(401)
        .json({ url: "/login", message: "Incorrect Password" });
    }
    return res.status(401).json({ url: "/login", message: "Unauthorized" });
  });
});

app.get("/signUp", (req, res) => {
  res.render("signUp.ejs");
});

app.post("/register", async (req, res) => {
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ireserve",
  });
  con.connect();

  const data = {
    Name: req.body.name,
    Email: req.body.email,
    Password: bcrypt.hashSync(req.body.password, 10),
  };
  let sql = "INSERT INTO customers Set?";
  con.query(sql, data, (err, result) => {
    if (err) throw err;
    //res.send(result);
  });
  res.redirect("/login");
});

app.listen("3000", () => {
  console.log("Server Started on Port 3000");
});
