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

app.get("/Dashboard/kukucube", (req, res) => {
    try {
        res.render("exerciese-2");
    }
    catch (err) {
        console.log(err);
    }
});

app.get("/Dashboard/tiktactoe", (req, res) => {
    try {
        res.render("tictak");
    }
    catch (err) {
        console.log(err);
    }
});

app.get("/Dashboard/eventtable", (req, res) => {
    try {
        res.render("event_table")
    }
    catch (err) {
        console.log(err);
    }
});

app.get("/Dashboard/listdatabase", function (req, res) {
    const total_page = 50000;
    const perPage = 200;
    const pageCount = Math.ceil(total_page / perPage);
    //   let page = 1;
    let page = parseInt(req.query.p);
    let order = req.query.order;
    //   console.log(page);
    //   console.log(page);
    if (pageCount < 1) {
        pageCount = 1;
    }
    if (isNaN(page)) {
        page = 1;
        // console.log("inside if");
    }

    let offset = (page - 1) * 200;

    let query = `select * from student_master1 limit 200 offset ${offset}`;

    connection.query(query, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("data selected");
        }
        // console.log(result);

        res.render("listtask", { data: result, currpage: page });
    });
});

app.get("/Dashboard/orderby", function (req, res) {
    let l = req.query.p;

    if (l < 1 || isNaN(l)) {
        l = 1;
    }
    if (l > 250) {
        l = 250;
    }

    let order = req.query.order || "asc";
    let column = req.query.column || "student_id";
    let offset = (Number(l) - 1) * 200;

    let query = `select * from student_master1 order by  ${column}  ${order} limit 200 offset ${offset}`;
    connection.query(query, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("data selected");
        }

        // console.log(result);

        res.render("orderby", { data: result, l, order, column });
    });
});

app.get("/report", function (req, res) {
    let l = parseInt(req.query.p);
    if (l < 1 || isNaN(l)) {
        l = 1;
    }
    if (l > 10) {
        l = 10;
    }

    let month = req.query.month || "december";
    let year = req.query.year || "2023";
    let offset = (Number(l) - 1) * 20;
    let order = req.query.order || "asc";
    let column = req.query.column || "id";

    let query = `select s.id,s.firstname, count(id) as atten_count ,count(month(atten_date))*100 / (30) as persentage from student_master s
    left join attendence_master e
    on s.id = e.studentid
    where monthname(atten_date) = '${month}' and year(atten_date)='${year}' and e.stu_status ="present"
    group by id order by ${column} ${order}  limit 20 offset ${offset}`;

    connection.query(query, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("data fetched");
        }
        // console.log(result);
        console.log(month);
        res.render("report", { data: result, l, month, year, order, column });
    });
});

app.get("/result", function (req, res) {
    let l = parseInt(req.query.p);
    if (l < 1 || isNaN(l)) {
        l = 1;
    }
    if (l > 10) {
        l = 10;
    }
    let offset = (Number(l) - 1) * 60;

    let res_query = `select s.id,s.firstname,sum(e.obtain_theorymarks) as ter_ob_the,sum(e.obtain_practicalmarks) as ter_ob_pre from student_master s
    inner join exam_master e
    on s.id = e.student_id 
    group by s.id,e.exam_type limit 60 offset ${offset}`;

    connection.query(res_query, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("data fetched");
        }
        let arr = [];
        console.log(result.length);
        for (let i = 0; i < result.length; i += 3) {
            let sum = 0;
            for (let j = i; j < i + 3; j++) {
                let theorymarks = result[j].ter_ob_the;
                // console.log(theorymarks);
                let practicalmarks = result[j].ter_ob_pre;
                // console.log(practicalmarks);
                sum += theorymarks + practicalmarks;
            }
            arr.push(sum);
        }
        let count = 0;
        // console.log(arr);
        res.render("result", { l, data: result, arr, count });
    });
});

app.get("/resultdetails", function (req, res) {
    let id = req.query.id;
    console.log(req.query);
    console.log(id);
    let query3 = `select s.id, s.firstname ,e.sub_id,e.exam_type, k.sub_name,e.obtain_theorymarks ,e.obtain_practicalmarks from student_master s 
    left join exam_master e on  s.id= e.student_id 
    left join subject_master k on e.sub_id = k.sub_id
       where s.id=${id}`;

    connection.query(query3, function (err, result) {
        let query4 = `  select count(studentid)as atten from attendence_master where stu_status="present" and studentid=${id}`;
        connection.query(query4, function (err, result2) {
            if (err) {
                console.log(err);
            } else {
                console.log("data fetched");
            }
            console.log(result2);
            res.render("resultdetails", { data: result, atten: result2 });
        });
        // console.log(result);
    });
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