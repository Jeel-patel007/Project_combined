var express = require("express");
var bodyParser = require("body-parser");
var path = require("path")
var mysql = require("mysql");
var md5 = require("md5");
var ValidateMiddle = require("./middleware");
const AuthMiddle = require("./Authware")
var jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
require('dotenv').config();
const PORT = process.env.PORT;
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
// app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
// mysql database connection
const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root_123",
    database: "project",
});

app.set("view engine", "ejs");

app.get("/", (req, res) => {

    res.clearCookie('token');
    res.render("index");

});

app.get("/register", (req, res) => {
    try {
        let message = '';
        data = {};
        res.render("form", { message, data });
    }
    catch (err) {
        console.log(err);
    }

});

app.post("/save", ValidateMiddle, async (req, res) => {
    try {
        let data = req.body;
        if (data.email == '') {
            res.send('invalid data ')
        }
        else {
            const randomAlphaNumeric = length => {
                let s = '';
                Array.from({ length }).some(() => {
                    s += Math.random().toString(36).slice(2);
                    return s.length >= length;
                });
                return s.slice(0, length);
            };
            let Query1 = `select * from users where email = '${data.email}'`;
            let Result1 = await ExecuteData(Query1);
            if (Result1.length > 0) {
                // console.log('invalid email');
                let message = 'Email already Exist!!'
                res.render("form", { message, data })
            }
            else {
                // storing randomalphanumeric of 4 digits into salt, and 12 digits into key.
                let salt = randomAlphaNumeric(4);
                var key = randomAlphaNumeric(12);
                // console.log(key);
                let password = `${data.password}${salt}`;
                let isActive = 0;
                // console.log(password);
                let hashedpwd = md5(password);
                // console.log(hashedpwd);
                let query = `insert into users(first_name,last_name,email,mobileno,salt,pwd,activation_key,isactive) value('${data.firstname}','${data.lastname}','${data.email}','${data.mobilenumber}','${salt}','${hashedpwd}','${key}' , ${isActive})`;
                // console.log(query);
                let result = await ExecuteData(query);
                let id = result.insertId;
                // console.log(id);
                res.render("save", { id, key });
            }
        }
    }
    catch (err) {
        console.log(err);
    }
    // console.log(data);
    // console.log(hashedpwd);

});

app.get("/active", async (req, res) => {
    try {
        let key = req.query.key;
        let id = req.query.id;
        console.log(key);
        console.log(id);
        let query = `select * from users where user_id=${id}`;
        let result = await ExecuteData(query);
        console.log(result);
        let createtime = result[0].time_stamp;
        let currenttime = new Date();

        let diff = currenttime - createtime;
        console.log(diff);
        if (key != result[0].activation_key || diff > 200000) {
            res.send("data activation failed!!");
        }
        else {
            let act_query = `update users set isactive = 1 where user_id=${result[0].user_id}`;
            console.log(act_query);
            await ExecuteData(act_query);
            res.render("active");
        }

    }
    catch (err) {
    }

});



app.get("/login", (req, res) => {
    try {
        res.render("login");
    }

    catch (err) {
        console.log(err);
    }

});
app.post("/logsave", async (req, res) => {
    try {
        let data = req.body;
        // console.log(data);
        let pwd = data.password;
        let query = `select * from users where email ='${data.username}'`;
        // console.log(query);
        let result = await ExecuteData(query);
        // console.log(result);
        if (result.length == 0) {
            res.status(404);
            res.json('invalid credential');
        }

        else {
            let pwd_hashed = md5(`${pwd}${result[0].salt}`);
            // console.log(pwd_hashed);
            // console.log(pwd_main);

            if (pwd_hashed != result[0].pwd) {
                res.status(404);
                res.json('invalid credential')
            }
            else {

                let jwtSecretKey = process.env.JWT_SECRET_KEY;
                let data = {
                    time: Date(),
                    userId: result.user_id
                }

                const token = jwt.sign(data, jwtSecretKey, { expiresIn: '1h' });
                res.cookie('token', token, { expires: new Date(Date.now() + 900000), httpOnly: true })
                res.status(200);
                res.json('login suceesful')
                // window.location.href = '/home'
            }
        }
    }
    catch (err) {
        console.log(err);
    }
});

app.get("/Dashboard", AuthMiddle, (req, res) => {
    try {

        res.render("home");

    }
    catch (err) {
        console.log(err);
    }


});

app.get("/forgot", (req, res) => {
    try {
        res.render("forgetpws");
    }
    catch (err) {
        console.log(err);
    }

});

app.post("/forgotsave", async (req, res) => {
    try {
        let data = req.body;
        // console.log(data);
        let query = `select * from users where email = '${data.email}'`;
        let result = await ExecuteData(query);
        console.log(result);
        if (result.length == 0) {
            res.status(404);
            res.json('email not exist')
        }
        else {
            res.status(200);
            res.json('enter password ')
        }

    }
    catch (err) {
    }
});

app.post("/resetpwd", async (req, res) => {
    try {
        let data = req.body;
        console.log(data);
        let query1 = `select * from users where email = '${data.email}'`;
        let result = await ExecuteData(query1);
        console.log(result);
        let salt = result[0].salt;
        let pwd_entered = `${data.password}${salt}`;
        let pwd = md5(pwd_entered);
        let query = `update users set pwd = '${pwd}' where user_id = ${result[0].user_id}`;
        await ExecuteData(query);
    }
    catch (err) {
        console.log(err);
    }

});

app.get("/Dashboard/dynamictable", (req, res) => {
    try {
        res.render("exerciese-1");
    }
    catch (err) {

    }
});

function ExecuteData(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (error, elements) => {
            if (error) {
                return reject(error);
            }
            else {
                console.log('data fetched');
                return resolve(elements);
            }

        });
    });
};

app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}/`);
});