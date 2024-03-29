var express = require("express");
var bodyParser = require("body-parser");
var path = require("path")
var mysql = require("mysql");
var md5 = require("md5");
var ValidateMiddle = require("./Middleware/middleware");
const AuthMiddle = require("./Middleware/Authware")
var jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
require('dotenv').config();
const PORT = process.env.port;
// console.log(PORT);
// PORT = 8084;
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
                res.cookie('token', token, { expires: new Date(Date.now() + 3600000), httpOnly: true })
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
        res.json('password updated');
    }
    catch (err) {
        console.log(err);
    }

});

app.get("/Dashboard/dynamictable", AuthMiddle, (req, res) => {
    try {
        res.render("exerciese-1");
    }
    catch (err) {

    }
});

app.get("/Dashboard/kukucube", AuthMiddle, (req, res) => {
    try {
        res.render("exerciese-2");
    }
    catch (err) {
        console.log(err);
    }
});

app.get("/Dashboard/tiktactoe", AuthMiddle, (req, res) => {
    try {
        res.render("tictak");
    }
    catch (err) {
        console.log(err);
    }
});

app.get("/Dashboard/eventtable", AuthMiddle, (req, res) => {
    try {
        res.render("event_table")
    }
    catch (err) {
        console.log(err);
    }
});

app.get("/Dashboard/Mergesort", AuthMiddle, (req, res) => {
    try {
        res.render("mergesort");
    }
    catch (err) {
        console.log(err);
    }
});

app.get("/listdatabase", AuthMiddle, function (req, res) {
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

        res.render("listtask", { data: result, l: page });
    });
});

app.get("/Dashboard/orderby", AuthMiddle, function (req, res) {
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

app.get("/report", AuthMiddle, function (req, res) {
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

app.get("/result", AuthMiddle, function (req, res) {
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

app.get("/resultdetails", AuthMiddle, function (req, res) {
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

app.get("/Dashboard/searching", AuthMiddle, function (req, res) {
    try {
        let id = req.query.id;
        let option = req.query.option;
        let firstname = req.query.firstname;
        let lastname = req.query.lastname;
        let country = req.query.country;
        let profession = req.query.profession;
        let detail_query = " ";

        if (req.query.id) {
            detail_query = ` where id in (${id})`;
        } else {
            let arr = [];
            if (firstname) arr.push(`firstname like '${firstname}%'`);
            if (lastname) arr.push(`lastname like '${lastname}%'`);
            if (country) arr.push(`country like '${country}%'`);
            if (profession) arr.push(`profession like '${profession}%'`);
            if (arr.length > 0) {
                detail_query = "where " + arr.join(` ${option} `);
            }
        }

        let query = `select * from student_master  ${detail_query} `;

        connection.query(query, function (err, result) {
            // if error then
            if (err) {
                console.log(err);
                res.render("serinvalid");
            } else {
                let l = req.query.p;

                if (l < 1 || isNaN(l)) {
                    l = 1;
                }
                // setting limit to number of records per page
                let limit = 10;
                let page = Math.ceil(result.length / limit);
                let offset = (Number(l) - 1) * limit;
                if (l > page) {
                    l = page;
                }

                let query2 = `select * from student_master  ${detail_query}limit ${limit} offset ${offset}`;
                // console.log(query2);
                connection.query(query2, function (err2, result2) {
                    if (err2) {
                        console.log(err2);
                        res.render("invalid");
                    } else {
                        res.render("orderby2", {
                            data: result2,
                            l,
                            id,
                            firstname,
                            option,
                            page,
                            profession,
                            country,
                        });
                    }
                });
            }
        });
    } catch {
        res.render("serinvalid");
    }
});

app.get("/Dashboard/delimetersearch", AuthMiddle, function (req, res) {
    try {
        // let ini = 0;
        // fetching  user input from the req.query
        let disply_string = req.query.user_string;
        // console.log(disply_string);
        // if (disply_string.length == 0) {
        //   console.log("inside disply string");
        //   ini = 1;
        // }
        let user_string = req.query.user_string + "_";

        let array = [];
        //slice string on occurrence of special character and store it on the array.
        for (let i = 0; i < user_string.length; i++) {
            for (let j = i + 1; j < user_string.length; j++) {
                if (
                    user_string[j] == "_" ||
                    user_string[j] == "^" ||
                    user_string[j] == "$" ||
                    user_string[j] == "}" ||
                    user_string[j] == "{" ||
                    user_string[j] == ":"
                ) {
                    let arr = user_string.slice(i, j);
                    array.push(arr);
                    i = j;
                }
            }
        }
        // console.log(array);
        // store all slice strings into respective column's array : for example _jeel will store in firstname .
        let firstname = [];
        let lastname = [];
        let email = [];
        let dataofbirth = [];
        let profession = [];
        let city = [];

        for (let k = 0; k < array.length; k++) {
            if (array[k].charAt(0) == "_") {
                firstname.push(`firstname like '%${array[k].slice(1)}%'`);
            }
            if (array[k].charAt(0) == "^") {
                lastname.push(`lastname like '%${array[k].slice(1)}%'`);
            }
            if (array[k].charAt(0) == "$") {
                email.push(`email like '%${array[k].slice(1)}%'`);
            }
            if (array[k].charAt(0) == "}") {
                dataofbirth.push(`dataofbirth like '%${array[k].slice(1)}%'`);
            }
            if (array[k].charAt(0) == "{") {
                profession.push(`profession like '%${array[k].slice(1)}%'`);
            }
            if (array[k].charAt(0) == ":") {
                city.push(`city like '%${array[k].slice(1)}%'`);
            }
        }

        // multiple value in same column will be join withe or operator.
        let arr = [];
        let detail_query = " ";
        if (firstname.length > 0) {
            let data = firstname.join(" or ");
            arr.push(data);
        }
        if (lastname.length > 0) {
            let data = lastname.join(" or ");
            arr.push(data);
        }
        if (email.length > 0) {
            let data = email.join(" or ");
            arr.push(data);
        }
        if (dataofbirth.length > 0) {
            let data = dataofbirth.join(" or ");
            arr.push(data);
        }
        if (profession.length > 0) {
            let data = profession.join(" or ");
            arr.push(data);
        }

        if (city.length > 0) {
            let data = city.join(" or ");
            arr.push(data);
        }
        // different columns will be join with the and operator
        // initially it will not show the data so we set initial varible to 0

        if (arr.length > 0) {
            detail_query = "where " + arr.join(" and ");
            // on enter of valid data we will set it to the 1.
            // ini = 1;
        }
        // console.log(detail_query);

        //sql query to that will  run to mysql database.
        let query2 = `select * from student_master ${detail_query}`;

        connection.query(query2, function (err2, result2) {
            if (err2) {
                console.log(err2);
                res.render("delinvalid");
            } else {
                res.render("delimeterorderby", {
                    data: result2,
                    user_string: disply_string,
                });
            }
        });
    } catch (err) {
        console.log(err);
    }
});

app.get("/Dashboard/form", AuthMiddle, (req, res) => {
    let data = [];
    data[0] = {};
    let data2 = {};
    let data3 = {};
    res.render("employeeform", { data, data2, data3 });
});

app.post("/Dashboard/save", AuthMiddle, async (req, res) => {

    try {
        res.render("jobdatasave");
        let data = req.body;
        // console.log(data);


        let query1 = `insert into basic_details(first_name,last_name,email,designation,address1,address2,city,state,phonenumber,zipcode,xender,dateofbirth,relationshipstatus) values ('${data.firstname}','${data.lastname}','${data.email}','${data.designation1}','${data.address1}','${data.address2}','${data.city}','${data.state}',
       '${data.phonenumber}','${data.zipcode}','${data.gender}','${data.dateofbirth}','${data.rstatus}')`;
        let result = await ExecuteData(query1);
        let id = result.insertId;

        // console.log(id);

        // console.log(data.board);
        for (let i = 0; i < data.board.length; i++) {
            if (data.board[i]) {
                let query2 = `insert into education(id,coursename,yearofpassing,percentage) values(${id},'${data.board[i]}',${data.year[i]},${data.marks[i]})`;
                // console.log(query2);
                await ExecuteData(query2);
            }
        }


        if (data.hindi) {
            let canread = data.hindiread || 0;
            let canwrite = data.hindiwrite || 0;
            let canspeak = data.hindispeak || 0;
            let query6 = `insert into language_known(id,languageknown,canread,canwrite,canspeak) values(${id},'${data.hindi}',${canread},${canwrite},${canspeak})`;
            // console.log(query6);
            await ExecuteData(query6);
        }
        if (data.english) {

            let canread = data.englishread || 0;
            let canwrite = data.englishwrite || 0;
            let canspeak = data.englishspeak || 0;

            let query7 = `insert into language_known(id,languageknown,canread,canwrite,canspeak) values(${id},'${data.english}',${canread},${canwrite},${canspeak})`;
            // console.log(query7);
            await ExecuteData(query7);
        }

        if (data.gujarati) {

            let canread = data.gujratiread || 0;
            let canwrite = data.gujratiwrite || 0;
            let canspeak = data.gujratispeak || 0;

            let query8 = `insert into language_known(id,languageknown,canread,canwrite,canspeak) values(${id},'${data.gujarati}',${canread},${canwrite},${canspeak})`;
            // console.log(query8);
            await ExecuteData(query8);
        }
        let technology = [];
        let level = [];
        technology.push(data.phptech || 0)
        technology.push(data.mysqltech || 0)
        technology.push(data.laraveltech || 0)
        technology.push(data.oracletech || 0)

        level.push(data.php || 0)
        level.push(data.mysql || 0)
        level.push(data.laravel || 0)
        level.push(data.oracle || 0)
        // console.log(technology);
        // console.log(level);
        for (let i = 0; i < 4; i++) {
            if (technology[i]) {
                let query9 = `insert into technology_known_master(id,technologyknown,level) value(${id},'${technology[i]}','${level[i]}')`;
                // console.log(query9);
                await ExecuteData(query9);
            }
        }

        let query10 = `insert into preference(id,preferedlocation,noticeperiod,expectedctc,currentctc,department) values (${id},'${data.preferedlocation}','${data.noticeperiod}',${data.expectedctc},${data.currentctc},'${data.department}')`;
        await ExecuteData(query10);
        // console.log(query10);
        for (let i = 0; i <= data.refname.length; i++) {


            if (data.refname[i]) {
                let query11 = `insert into  referencecontact(id,personname,contactnumber,relationship) values(${id},'${data.refname[i]}','${data.refnumber[i]}','${data.refrelation[i]}')`;
                // console.log(query11);
                await ExecuteData(query11);
            }
        }


        for (let i = 0; i < data.companyname.length; i++) {
            if (data.companyname[i]) {

                let query13 = `insert into  work_experience(id,companyname ,designation,startdate ,enddate) values(${id},'${data.companyname[i]}','${data.designation2[i]}','${data.from[i]}','${data.to[i]}')`;
                // console.log(query13);
                await ExecuteData(query13);
            }
        }


    }
    catch (err) {
        console.log(err);
    }

});
app.get("/Dashboard/update", AuthMiddle, async (req, res) => {

    let query1 = `select * from basic_details`;

    let result = await ExecuteData(query1);
    // console.log(result);
    res.render("listofemployee", { data: result });


});
app.get("/Dashboard/upsave", AuthMiddle, async (req, res) => {
    let id = req.query.id || 1;
    let query1 = ` select * , DATE_FORMAT(dateofbirth, "%Y-%m-%d") as dateofbirth  from basic_details where employee_id = ${id}`;
    let query2 = `select * from education where id=${id}`;
    let query3 = `select * from language_known where id=${id}`;
    let query4 = `select * from technology_known_master where id=${id}`;
    let query5 = `select * , DATE_FORMAT(startdate, "%Y-%m-%d")as startdate , DATE_FORMAT(enddate, "%Y-%m-%d")as enddate from work_experience where id=${id}`;
    let query6 = `select * from referencecontact where id=${id}`;
    let query7 = `select * from preference where id=${id}`;
    let result1 = await ExecuteData(query1);
    let result2 = await ExecuteData(query2);
    let result3 = await ExecuteData(query3);
    let result4 = await ExecuteData(query4);
    let result5 = await ExecuteData(query5);
    let result6 = await ExecuteData(query6);
    let result7 = await ExecuteData(query7);
    if (result1.length == 0) {
        result1 = [{}];
    }
    if (result7.length == 0) {
        result7 = [{}];
    }
    // console.log(result4);
    // console.log(result1);
    res.render("update", { data: result1, data2: result2, data3: result7, data4: result5, data5: result6, data6: result4, data7: result3 });
});
app.post("/datasave", async (req, res) => {
    try {


        let data = req.body;
        console.log(data);
        let id = req.query.id || 1;
        console.log(data);
        let query1 = `update basic_details set first_name= '${data.firstname}' , last_name= '${data.lastname}', email='${data.email}' , designation=
      '${data.designation1}' ,city ='${data.city}' , dateofbirth= '${data.dateofbirth}' ,state ='${data.state}' ,address1='${data.address1}',address2='${data.address2}',relationshipstatus='${data.rstatus}',xender='${data.gender}',zipcode='${data.zipcode}' where employee_id=${id}`;
        // console.log(query1);
        await ExecuteData(query1);

        for (let i = 0; i < data.board.length; i++) {
            if (data.board[i]) {
                let query2 = `update education set coursename='${data.board[i]}',yearofpassing=${data.year[i]},percentage=${data.marks[i]} where id=${id} and edu_id=${data.eduid[i]}`;
                // console.log(query2);
                await ExecuteData(query2);
            }
        }

        if (data.hindi) {
            let canread = data.hindiread || 0;
            let canwrite = data.hindiwrite || 0;
            let canspeak = data.hindispeak || 0;
            let query6 = `update language_known set languageknown='${data.hindi}',canread=${canread},canwrite=${canwrite},canspeak=${canspeak} where id=${id} and languageknown='${data.hindi}'`;
            // console.log(query6);
            await ExecuteData(query6);
        }
        if (data.english) {

            let canread = data.englishread || 0;
            let canwrite = data.englishwrite || 0;
            let canspeak = data.englishspeak || 0;

            let query7 = `update language_known set languageknown='${data.english}',canread=${canread},canwrite=${canwrite},canspeak=${canspeak} where id=${id} and languageknown='${data.english}'`;
            // console.log(query7);
            await ExecuteData(query7);
        }

        if (data.gujarati) {

            let canread = data.gujratiread || 0;
            let canwrite = data.gujratiwrite || 0;
            let canspeak = data.gujratispeak || 0;

            let query8 = `update language_known set languageknown='${data.gujarati}',canread=${canread},canwrite=${canwrite},canspeak=${canspeak} where id=${id} and languageknown='${data.gujarati}'`;

            // console.log(query8);
            await ExecuteData(query8);
        }

        let technology = [];
        let level = [];
        technology.push(data.phptech || 0)
        technology.push(data.mysqltech || 0)
        technology.push(data.laraveltech || 0)
        technology.push(data.oracletech || 0)

        level.push(data.php || 0)
        level.push(data.mysql || 0)
        level.push(data.laravel || 0)
        level.push(data.oracle || 0)
        // console.log(technology);
        // console.log(level);
        for (let i = 0; i < 4; i++) {
            if (technology[i]) {
                let query9 = `update  technology_known_master set technologyknown='${technology[i]}',level='${level[i]}' where id=${id} and technologyknown='${technology[i]}'`;
                // console.log(query9);
                await ExecuteData(query9);
            }
        }
        let query10 = `update preference set  preferedlocation='${data.preferedlocation}',noticeperiod='${data.noticeperiod}',expectedctc=${data.expectedctc},currentctc=${data.currentctc},department='${data.department}' where id=${id}`;
        console.log(query10);
        await ExecuteData(query10);

        for (let i = 0; i <= data.refname.length; i++) {


            if (data.refname[i]) {
                let query11 = `update  referencecontact set  personname='${data.refname[i]}',contactnumber='${data.refnumber[i]}',relationship='${data.refrelation[i]}' where id=${id} and ref_id=${data.refid[i]}`;
                // console.log(query11);
                await ExecuteData(query11);
            }
        }


        for (let i = 0; i < data.companyname.length; i++) {
            if (data.companyname[i]) {

                let query13 = `update  work_experience set companyname ='${data.companyname[i]}',designation='${data.designation2[i]}',startdate='${data.from[i]}',enddate='${data.to[i]}' where id=${id} and exper_id=${data.workid[i]}`;
                console.log(query13);
                await ExecuteData(query13);
            }
        }

        res.render("updated");
    }
    catch (err) {
        console.log(err);
    }
});
app.get("/Dashboard/statecity", AuthMiddle, (req, res) => {
    res.render("ajaxstatecity");
});
app.get("/ajaxstatedata", AuthMiddle, (req, res) => {
    // var state_arr = new Array("Andaman & Nicobar", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra & Nagar Haveli", "Daman & Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Orissa", "Pondicherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Tripura", "Uttar Pradesh", "Uttaranchal", "West Bengal");

    var s_a = new Array();
    s_a[0] = "";
    s_a[1] = " Alipur | Andaman Island | Anderson Island | Arainj-Laka-Punga | Austinabad | Bamboo Flat | Barren Island | Beadonabad | Betapur | Bindraban | Bonington | Brookesabad | Cadell Point | Calicut | Chetamale | Cinque Islands | Defence Island | Digilpur | Dolyganj | Flat Island | Geinyale | Great Coco Island | Haddo | Havelock Island | Henry Lawrence Island | Herbertabad | Hobdaypur | Ilichar | Ingoie | Inteview Island | Jangli Ghat | Jhon Lawrence Island | Karen | Kartara | KYD Islannd | Landfall Island | Little Andmand | Little Coco Island | Long Island | Maimyo | Malappuram | Manglutan | Manpur | Mitha Khari | Neill Island | Nicobar Island | North Brother Island | North Passage Island | North Sentinel Island | Nothen Reef Island | Outram Island | Pahlagaon | Palalankwe | Passage Island | Phaiapong | Phoenix Island | Port Blair | Preparis Island | Protheroepur | Rangachang | Rongat | Rutland Island | Sabari | Saddle Peak | Shadipur | Smith Island | Sound Island | South Sentinel Island | Spike Island | Tarmugli Island | Taylerabad | Titaije | Toibalawe | Tusonabad | West Island | Wimberleyganj | Yadita";
    s_a[2] = " Achampet | Adilabad | Adoni | Alampur | Allagadda | Alur | Amalapuram | Amangallu | Anakapalle | Anantapur | Andole | Araku | Armoor | Asifabad | Aswaraopet | Atmakur | B. Kothakota | Badvel | Banaganapalle | Bandar | Bangarupalem | Banswada | Bapatla | Bellampalli | Bhadrachalam | Bhainsa | Bheemunipatnam | Bhimadole | Bhimavaram | Bhongir | Bhooragamphad | Boath | Bobbili | Bodhan | Chandoor | Chavitidibbalu | Chejerla | Chepurupalli | Cherial | Chevella | Chinnor | Chintalapudi | Chintapalle | Chirala | Chittoor | Chodavaram | Cuddapah | Cumbum | Darsi | Devarakonda | Dharmavaram | Dichpalli | Divi | Donakonda | Dronachalam | East Godavari | Eluru | Eturnagaram | Gadwal | Gajapathinagaram | Gajwel | Garladinne | Giddalur | Godavari | Gooty | Gudivada | Gudur | Guntur | Hindupur | Hunsabad | Huzurabad | Huzurnagar | Hyderabad | Ibrahimpatnam | Jaggayyapet | Jagtial | Jammalamadugu | Jangaon | Jangareddygudem | Jannaram | Kadiri | Kaikaluru | Kakinada | Kalwakurthy | Kalyandurg | Kamalapuram | Kamareddy | Kambadur | Kanaganapalle | Kandukuru | Kanigiri | Karimnagar | Kavali | Khammam | Khanapur (AP) | Kodangal | Koduru | Koilkuntla | Kollapur | Kothagudem | Kovvur | Krishna | Krosuru | Kuppam | Kurnool | Lakkireddipalli | Madakasira | Madanapalli | Madhira | Madnur | Mahabubabad | Mahabubnagar | Mahadevapur | Makthal | Mancherial | Mandapeta | Mangalagiri | Manthani | Markapur | Marturu | Medachal | Medak | Medarmetla | Metpalli | Mriyalguda | Mulug | Mylavaram | Nagarkurnool | Nalgonda | Nallacheruvu | Nampalle | Nandigama | Nandikotkur | Nandyal | Narasampet | Narasaraopet | Narayanakhed | Narayanpet | Narsapur | Narsipatnam | Nazvidu | Nelloe | Nellore | Nidamanur | Nirmal | Nizamabad | Nuguru | Ongole | Outsarangapalle | Paderu | Pakala | Palakonda | Paland | Palmaneru | Pamuru | Pargi | Parkal | Parvathipuram | Pathapatnam | Pattikonda | Peapalle | Peddapalli | Peddapuram | Penukonda | Piduguralla | Piler | Pithapuram | Podili | Polavaram | Prakasam | Proddatur | Pulivendla | Punganur | Putturu | Rajahmundri | Rajampeta | Ramachandrapuram | Ramannapet | Rampachodavaram | Rangareddy | Rapur | Rayachoti | Rayadurg | Razole | Repalle | Saluru | Sangareddy | Sathupalli | Sattenapalle | Satyavedu | Shadnagar | Siddavattam | Siddipet | Sileru | Sircilla | Sirpur Kagaznagar | Sodam | Sompeta | Srikakulam | Srikalahasthi | Srisailam | Srungavarapukota | Sudhimalla | Sullarpet | Tadepalligudem | Tadipatri | Tanduru | Tanuku | Tekkali | Tenali | Thungaturthy | Tirivuru | Tirupathi | Tuni | Udaygiri | Ulvapadu | Uravakonda | Utnor | V.R. Puram | Vaimpalli | Vayalpad | Venkatgiri | Venkatgirikota | Vijayawada | Vikrabad | Vinjamuru | Vinukonda | Visakhapatnam | Vizayanagaram | Vizianagaram | Vuyyuru | Wanaparthy | Warangal | Wardhannapet | Yelamanchili | Yelavaram | Yeleswaram | Yellandu | Yellanuru | Yellareddy | Yerragondapalem | Zahirabad ";
    s_a[3] = " Along | Anini | Anjaw | Bameng | Basar | Changlang | Chowkhem | Daporizo | Dibang Valley | Dirang | Hayuliang | Huri | Itanagar | Jairampur | Kalaktung | Kameng | Khonsa | Kolaring | Kurung Kumey | Lohit | Lower Dibang Valley | Lower Subansiri | Mariyang | Mechuka | Miao | Nefra | Pakkekesang | Pangin | Papum Pare | Passighat | Roing | Sagalee | Seppa | Siang | Tali | Taliha | Tawang | Tezu | Tirap | Tuting | Upper Siang | Upper Subansiri | Yiang Kiag ";
    s_a[4] = " Abhayapuri | Baithalangshu | Barama | Barpeta Road | Bihupuria | Bijni | Bilasipara | Bokajan | Bokakhat | Boko | Bongaigaon | Cachar | Cachar Hills | Darrang | Dhakuakhana | Dhemaji | Dhubri | Dibrugarh | Digboi | Diphu | Goalpara | Gohpur | Golaghat | Guwahati | Hailakandi | Hajo | Halflong | Hojai | Howraghat | Jorhat | Kamrup | Karbi Anglong | Karimganj | Kokarajhar | Kokrajhar | Lakhimpur | Maibong | Majuli | Mangaldoi | Mariani | Marigaon | Moranhat | Morigaon | Nagaon | Nalbari | Rangapara | Sadiya | Sibsagar | Silchar | Sivasagar | Sonitpur | Tarabarihat | Tezpur | Tinsukia | Udalgiri | Udalguri | UdarbondhBarpeta";
    s_a[5] = " Adhaura | Amarpur | Araria | Areraj | Arrah | Arwal | Aurangabad | Bagaha | Banka | Banmankhi | Barachakia | Barauni | Barh | Barosi | Begusarai | Benipatti | Benipur | Bettiah | Bhabhua | Bhagalpur | Bhojpur | Bidupur | Biharsharif | Bikram | Bikramganj | Birpur | Buxar | Chakai | Champaran | Chapara | Dalsinghsarai | Danapur | Darbhanga | Daudnagar | Dhaka | Dhamdaha | Dumraon | Ekma | Forbesganj | Gaya | Gogri | Gopalganj | H.Kharagpur | Hajipur | Hathua | Hilsa | Imamganj | Jahanabad | Jainagar | Jamshedpur | Jamui | Jehanabad | Jhajha | Jhanjharpur | Kahalgaon | Kaimur (Bhabua) | Katihar | Katoria | Khagaria | Kishanganj | Korha | Lakhisarai | Madhepura | Madhubani | Maharajganj | Mahua | Mairwa | Mallehpur | Masrakh | Mohania | Monghyr | Motihari | Motipur | Munger | Muzaffarpur | Nabinagar | Nalanda | Narkatiaganj | Naugachia | Nawada | Pakribarwan | Pakridayal | Patna | Phulparas | Piro | Pupri | Purena | Purnia | Rafiganj | Rajauli | Ramnagar | Raniganj | Raxaul | Rohtas | Rosera | S.Bakhtiarpur | Saharsa | Samastipur | Saran | Sasaram | Seikhpura | Sheikhpura | Sheohar | Sherghati | Sidhawalia | Singhwara | Sitamarhi | Siwan | Sonepur | Supaul | Thakurganj | Triveniganj | Udakishanganj | Vaishali | Wazirganj";
    s_a[6] = " Chandigarh | Mani Marja";
    s_a[7] = " Ambikapur | Antagarh | Arang | Bacheli | Bagbahera | Bagicha | Baikunthpur | Balod | Balodabazar | Balrampur | Barpalli | Basana | Bastanar | Bastar | Bderajpur | Bemetara | Berla | Bhairongarh | Bhanupratappur | Bharathpur | Bhatapara | Bhilai | Bhilaigarh | Bhopalpatnam | Bijapur | Bilaspur | Bodla | Bokaband | Chandipara | Chhinagarh | Chhuriakala | Chingmut | Chuikhadan | Dabhara | Dallirajhara | Dantewada | Deobhog | Dhamda | Dhamtari | Dharamjaigarh | Dongargarh | Durg | Durgakondal | Fingeshwar | Gariaband | Garpa | Gharghoda | Gogunda | Ilamidi | Jagdalpur | Janjgir | Janjgir-Champa | Jarwa | Jashpur | Jashpurnagar | Kabirdham-Kawardha | Kanker | Kasdol | Kathdol | Kathghora | Kawardha | Keskal | Khairgarh | Kondagaon | Konta | Korba | Korea | Kota | Koyelibeda | Kuakunda | Kunkuri | Kurud | Lohadigundah | Lormi | Luckwada | Mahasamund | Makodi | Manendragarh | Manpur | Marwahi | Mohla | Mungeli | Nagri | Narainpur | Narayanpur | Neora | Netanar | Odgi | Padamkot | Pakhanjur | Pali | Pandaria | Pandishankar | Parasgaon | Pasan | Patan | Pathalgaon | Pendra | Pratappur | Premnagar | Raigarh | Raipur | Rajnandgaon | Rajpur | Ramchandrapur | Saraipali | Saranggarh | Sarona | Semaria | Shakti | Sitapur | Sukma | Surajpur | Surguja | Tapkara | Toynar | Udaipur | Uproda | Wadrainagar";
    s_a[8] = " Amal | Amli | Bedpa | Chikhli | Dadra & Nagar Haveli | Dahikhed | Dolara | Galonda | Kanadi | Karchond | Khadoli | Kharadpada | Kherabari | Kherdi | Kothar | Luari | Mashat | Rakholi | Rudana | Saili | Sili | Silvassa | Sindavni | Udva | Umbarkoi | Vansda | Vasona | Velugam ";
    s_a[9] = " Brancavare | Dagasi | Daman | Diu | Magarvara | Nagwa | Pariali | Passo Covo ";
    s_a[10] = " Central Delhi | East Delhi | New Delhi | North Delhi | North East Delhi | North West Delhi | South Delhi | South West Delhi | West Delhi ";
    s_a[11] = " Canacona | Candolim | Chinchinim | Cortalim | Goa | Jua | Madgaon | Mahem | Mapuca | Marmagao | Panji | Ponda | Sanvordem | Terekhol ";
    s_a[12] = " Ahmedabad | Ahwa | Amod | Amreli | Anand | Anjar | Ankaleshwar | Babra | Balasinor | Banaskantha | Bansada | Bardoli | Bareja | Baroda | Barwala | Bayad | Bhachav | Bhanvad | Bharuch | Bhavnagar | Bhiloda | Bhuj | Billimora | Borsad | Botad | Chanasma | Chhota Udaipur | Chotila | Dabhoi | Dahod | Damnagar | Dang | Danta | Dasada | Dediapada | Deesa | Dehgam | Deodar | Devgadhbaria | Dhandhuka | Dhanera | Dharampur | Dhari | Dholka | Dhoraji | Dhrangadhra | Dhrol | Dwarka | Fortsongadh | Gadhada | Gandhi Nagar | Gariadhar | Godhra | Gogodar | Gondal | Halol | Halvad | Harij | Himatnagar | Idar | Jambusar | Jamjodhpur | Jamkalyanpur | Jamnagar | Jasdan | Jetpur | Jhagadia | Jhalod | Jodia | Junagadh | Junagarh | Kalawad | Kalol | Kapad Wanj | Keshod | Khambat | Khambhalia | Khavda | Kheda | Khedbrahma | Kheralu | Kodinar | Kotdasanghani | Kunkawav | Kutch | Kutchmandvi | Kutiyana | Lakhpat | Lakhtar | Lalpur | Limbdi | Limkheda | Lunavada | M.M.Mangrol | Mahuva | Malia-Hatina | Maliya | Malpur | Manavadar | Mandvi | Mangrol | Mehmedabad | Mehsana | Miyagam | Modasa | Morvi | Muli | Mundra | Nadiad | Nakhatrana | Nalia | Narmada | Naswadi | Navasari | Nizar | Okha | Paddhari | Padra | Palanpur | Palitana | Panchmahals | Patan | Pavijetpur | Porbandar | Prantij | Radhanpur | Rahpar | Rajaula | Rajkot | Rajpipla | Ranavav | Sabarkantha | Sanand | Sankheda | Santalpur | Santrampur | Savarkundla | Savli | Sayan | Sayla | Shehra | Sidhpur | Sihor | Sojitra | Sumrasar | Surat | Surendranagar | Talaja | Thara | Tharad | Thasra | Una-Diu | Upleta | Vadgam | Vadodara | Valia | Vallabhipur | Valod | Valsad | Vanthali | Vapi | Vav | Veraval | Vijapur | Viramgam | Visavadar | Visnagar | Vyara | Waghodia | Wankaner ";
    s_a[13] = " Adampur Mandi | Ambala | Assandh | Bahadurgarh | Barara | Barwala | Bawal | Bawanikhera | Bhiwani | Charkhidadri | Cheeka | Chhachrauli | Dabwali | Ellenabad | Faridabad | Fatehabad | Ferojpur Jhirka | Gharaunda | Gohana | Gurgaon | Hansi | Hisar | Jagadhari | Jatusana | Jhajjar | Jind | Julana | Kaithal | Kalanaur | Kalanwali | Kalka | Karnal | Kosli | Kurukshetra | Loharu | Mahendragarh | Meham | Mewat | Mohindergarh | Naraingarh | Narnaul | Narwana | Nilokheri | Nuh | Palwal | Panchkula | Panipat | Pehowa | Ratia | Rewari | Rohtak | Safidon | Sirsa | Siwani | Sonipat | Tohana | Tohsam | Yamunanagar ";
    s_a[14] = " Amb | Arki | Banjar | Bharmour | Bilaspur | Chamba | Churah | Dalhousie | Dehra Gopipur | Hamirpur | Jogindernagar | Kalpa | Kangra | Kinnaur | Kullu | Lahaul | Mandi | Nahan | Nalagarh | Nirmand | Nurpur | Palampur | Pangi | Paonta | Pooh | Rajgarh | Rampur Bushahar | Rohru | Shimla | Sirmaur | Solan | Spiti | Sundernagar | Theog | Udaipur | Una";
    s_a[15] = " Akhnoor | Anantnag | Badgam | Bandipur | Baramulla | Basholi | Bedarwah | Budgam | Doda | Gulmarg | Jammu | Kalakot | Kargil | Karnah | Kathua | Kishtwar | Kulgam | Kupwara | Leh | Mahore | Nagrota | Nobra | Nowshera | Nyoma | Padam | Pahalgam | Patnitop | Poonch | Pulwama | Rajouri | Ramban | Ramnagar | Reasi | Samba | Srinagar | Udhampur | Vaishno Devi ";
    s_a[16] = " Bagodar | Baharagora | Balumath | Barhi | Barkagaon | Barwadih | Basia | Bermo | Bhandaria | Bhawanathpur | Bishrampur | Bokaro | Bolwa | Bundu | Chaibasa | Chainpur | Chakardharpur | Chandil | Chatra | Chavparan | Daltonganj | Deoghar | Dhanbad | Dumka | Dumri | Garhwa | Garu | Ghaghra | Ghatsila | Giridih | Godda | Gomia | Govindpur | Gumla | Hazaribagh | Hunterganj | Ichak | Itki | Jagarnathpur | Jamshedpur | Jamtara | Japla | Jharmundi | Jhinkpani | Jhumaritalaiya | Kathikund | Kharsawa | Khunti | Koderma | Kolebira | Latehar | Lohardaga | Madhupur | Mahagama | Maheshpur Raj | Mandar | Mandu | Manoharpur | Muri | Nagarutatri | Nala | Noamundi | Pakur | Palamu | Palkot | Patan | Rajdhanwar | Rajmahal | Ramgarh | Ranchi | Sahibganj | Saraikela | Simaria | Simdega | Singhbhum | Tisri | Torpa ";
    s_a[17] = " Afzalpur | Ainapur | Aland | Alur | Anekal | Ankola | Arsikere | Athani | Aurad | Bableshwar | Badami | Bagalkot | Bagepalli | Bailhongal | Bangalore | Bangalore Rural | Bangarpet | Bantwal | Basavakalyan | Basavanabagewadi | Basavapatna | Belgaum | Bellary | Belthangady | Belur | Bhadravati | Bhalki | Bhatkal | Bidar | Bijapur | Biligi | Chadchan | Challakere | Chamrajnagar | Channagiri | Channapatna | Channarayapatna | Chickmagalur | Chikballapur | Chikkaballapur | Chikkanayakanahalli | Chikkodi | Chikmagalur | Chincholi | Chintamani | Chitradurga | Chittapur | Cowdahalli | Davanagere | Deodurga | Devangere | Devarahippargi | Dharwad | Doddaballapur | Gadag | Gangavathi | Gokak | Gowribdanpur | Gubbi | Gulbarga | Gundlupet | H.B.Halli | H.D. Kote | Haliyal | Hampi | Hangal | Harapanahalli | Hassan | Haveri | Hebri | Hirekerur | Hiriyur | Holalkere | Holenarsipur | Honnali | Honnavar | Hosadurga | Hosakote | Hosanagara | Hospet | Hubli | Hukkeri | Humnabad | Hungund | Hunsagi | Hunsur | Huvinahadagali | Indi | Jagalur | Jamkhandi | Jewargi | Joida | K.R. Nagar | Kadur | Kalghatagi | Kamalapur | Kanakapura | Kannada | Kargal | Karkala | Karwar | Khanapur | Kodagu | Kolar | Kollegal | Koppa | Koppal | Koratageri | Krishnarajapet | Kudligi | Kumta | Kundapur | Kundgol | Kunigal | Kurugodu | Kustagi | Lingsugur | Madikeri | Madugiri | Malavalli | Malur | Mandya | Mangalore | Manipal | Manvi | Mashal | Molkalmuru | Mudalgi | Muddebihal | Mudhol | Mudigere | Mulbagal | Mundagod | Mundargi | Murugod | Mysore | Nagamangala | Nanjangud | Nargund | Narsimrajapur | Navalgund | Nelamangala | Nimburga | Pandavapura | Pavagada | Puttur | Raibag | Raichur | Ramdurg | Ranebennur | Ron | Sagar | Sakleshpur | Salkani | Sandur | Saundatti | Savanur | Sedam | Shahapur | Shankarnarayana | Shikaripura | Shimoga | Shirahatti | Shorapur | Siddapur | Sidlaghatta | Sindagi | Sindhanur | Sira | Sirsi | Siruguppa | Somwarpet | Sorab | Sringeri | Sriniwaspur | Srirangapatna | Sullia | T. Narsipur | Tallak | Tarikere | Telgi | Thirthahalli | Tiptur | Tumkur | Turuvekere | Udupi | Virajpet | Wadi | Yadgiri | Yelburga | Yellapur ";
    s_a[18] = " Adimaly | Adoor | Agathy | Alappuzha | Alathur | Alleppey | Alwaye | Amini | Androth | Attingal | Badagara | Bitra | Calicut | Cannanore | Chetlet | Ernakulam | Idukki | Irinjalakuda | Kadamath | Kalpeni | Kalpetta | Kanhangad | Kanjirapally | Kannur | Karungapally | Kasargode | Kavarathy | Kiltan | Kochi | Koduvayur | Kollam | Kottayam | Kovalam | Kozhikode | Kunnamkulam | Malappuram | Mananthodi | Manjeri | Mannarghat | Mavelikkara | Minicoy | Munnar | Muvattupuzha | Nedumandad | Nedumgandam | Nilambur | Palai | Palakkad | Palghat | Pathaanamthitta | Pathanamthitta | Payyanur | Peermedu | Perinthalmanna | Perumbavoor | Punalur | Quilon | Ranni | Shertallai | Shoranur | Taliparamba | Tellicherry | Thiruvananthapuram | Thodupuzha | Thrissur | Tirur | Tiruvalla | Trichur | Trivandrum | Uppala | Vadakkanchery | Vikom | Wayanad ";
    s_a[19] = " Agatti Island | Bingaram Island | Bitra Island | Chetlat Island | Kadmat Island | Kalpeni Island | Kavaratti Island | Kiltan Island | Lakshadweep Sea | Minicoy Island | North Island | South Island ";
    s_a[20] = " Agar | Ajaigarh | Alirajpur | Amarpatan | Amarwada | Ambah | Anuppur | Arone | Ashoknagar | Ashta | Atner | Babaichichli | Badamalhera | Badarwsas | Badnagar | Badnawar | Badwani | Bagli | Baihar | Balaghat | Baldeogarh | Baldi | Bamori | Banda | Bandhavgarh | Bareli | Baroda | Barwaha | Barwani | Batkakhapa | Begamganj | Beohari | Berasia | Berchha | Betul | Bhainsdehi | Bhander | Bhanpura | Bhikangaon | Bhimpur | Bhind | Bhitarwar | Bhopal | Biaora | Bijadandi | Bijawar | Bijaypur | Bina | Birsa | Birsinghpur | Budhni | Burhanpur | Buxwaha | Chachaura | Chanderi | Chaurai | Chhapara | Chhatarpur | Chhindwara | Chicholi | Chitrangi | Churhat | Dabra | Damoh | Datia | Deori | Deosar | Depalpur | Dewas | Dhar | Dharampuri | Dindori | Gadarwara | Gairatganj | Ganjbasoda | Garoth | Ghansour | Ghatia | Ghatigaon | Ghorandogri | Ghughari | Gogaon | Gohad | Goharganj | Gopalganj | Gotegaon | Gourihar | Guna | Gunnore | Gwalior | Gyraspur | Hanumana | Harda | Harrai | Harsud | Hatta | Hoshangabad | Ichhawar | Indore | Isagarh | Itarsi | Jabalpur | Jabera | Jagdalpur | Jaisinghnagar | Jaithari | Jaitpur | Jaitwara | Jamai | Jaora | Jatara | Jawad | Jhabua | Jobat | Jora | Kakaiya | Kannod | Kannodi | Karanjia | Kareli | Karera | Karhal | Karpa | Kasrawad | Katangi | Katni | Keolari | Khachrod | Khajuraho | Khakner | Khalwa | Khandwa | Khaniadhana | Khargone | Khategaon | Khetia | Khilchipur | Khirkiya | Khurai | Kolaras | Kotma | Kukshi | Kundam | Kurwai | Kusmi | Laher | Lakhnadon | Lamta | Lanji | Lateri | Laundi | Maheshwar | Mahidpurcity | Maihar | Majhagwan | Majholi | Malhargarh | Manasa | Manawar | Mandla | Mandsaur | Manpur | Mauganj | Mawai | Mehgaon | Mhow | Morena | Multai | Mungaoli | Nagod | Nainpur | Narsingarh | Narsinghpur | Narwar | Nasrullaganj | Nateran | Neemuch | Niwari | Niwas | Nowgaon | Pachmarhi | Pandhana | Pandhurna | Panna | Parasia | Patan | Patera | Patharia | Pawai | Petlawad | Pichhore | Piparia | Pohari | Prabhapattan | Punasa | Pushprajgarh | Raghogarh | Raghunathpur | Rahatgarh | Raisen | Rajgarh | Rajpur | Ratlam | Rehli | Rewa | Sabalgarh | Sagar | Sailana | Sanwer | Sarangpur | Sardarpur | Satna | Saunsar | Sehore | Sendhwa | Seondha | Seoni | Seonimalwa | Shahdol | Shahnagar | Shahpur | Shajapur | Sheopur | Sheopurkalan | Shivpuri | Shujalpur | Sidhi | Sihora | Silwani | Singrauli | Sirmour | Sironj | Sitamau | Sohagpur | Sondhwa | Sonkatch | Susner | Tamia | Tarana | Tendukheda | Teonthar | Thandla | Tikamgarh | Timarani | Udaipura | Ujjain | Umaria | Umariapan | Vidisha | Vijayraghogarh | Waraseoni | Zhirnia ";
    s_a[21] = " Achalpur | Aheri | Ahmednagar | Ahmedpur | Ajara | Akkalkot | Akola | Akole | Akot | Alibagh | Amagaon | Amalner | Ambad | Ambejogai | Amravati | Arjuni Merogaon | Arvi | Ashti | Atpadi | Aurangabad | Ausa | Babhulgaon | Balapur | Baramati | Barshi Takli | Barsi | Basmatnagar | Bassein | Beed | Bhadrawati | Bhamregadh | Bhandara | Bhir | Bhiwandi | Bhiwapur | Bhokar | Bhokardan | Bhoom | Bhor | Bhudargad | Bhusawal | Billoli | Brahmapuri | Buldhana | Butibori | Chalisgaon | Chamorshi | Chandgad | Chandrapur | Chandur | Chanwad | Chhikaldara | Chikhali | Chinchwad | Chiplun | Chopda | Chumur | Dahanu | Dapoli | Darwaha | Daryapur | Daund | Degloor | Delhi Tanda | Deogad | Deolgaonraja | Deori | Desaiganj | Dhadgaon | Dhanora | Dharani | Dhiwadi | Dhule | Dhulia | Digras | Dindori | Edalabad | Erandul | Etapalli | Gadhchiroli | Gadhinglaj | Gaganbavada | Gangakhed | Gangapur | Gevrai | Ghatanji | Golegaon | Gondia | Gondpipri | Goregaon | Guhagar | Hadgaon | Hatkangale | Hinganghat | Hingoli | Hingua | Igatpuri | Indapur | Islampur | Jalgaon | Jalna | Jamkhed | Jamner | Jath | Jawahar | Jintdor | Junnar | Kagal | Kaij | Kalamb | Kalamnuri | Kallam | Kalmeshwar | Kalwan | Kalyan | Kamptee | Kandhar | Kankavali | Kannad | Karad | Karjat | Karmala | Katol | Kavathemankal | Kedgaon | Khadakwasala | Khamgaon | Khed | Khopoli | Khultabad | Kinwat | Kolhapur | Kopargaon | Koregaon | Kudal | Kuhi | Kurkheda | Kusumba | Lakhandur | Langa | Latur | Lonar | Lonavala | Madangad | Madha | Mahabaleshwar | Mahad | Mahagaon | Mahasala | Mahaswad | Malegaon | Malgaon | Malgund | Malkapur | Malsuras | Malwan | Mancher | Mangalwedha | Mangaon | Mangrulpur | Manjalegaon | Manmad | Maregaon | Mehda | Mekhar | Mohadi | Mohol | Mokhada | Morshi | Mouda | Mukhed | Mul | Mumbai | Murbad | Murtizapur | Murud | Nagbhir | Nagpur | Nahavara | Nanded | Nandgaon | Nandnva | Nandurbar | Narkhed | Nashik | Navapur | Ner | Newasa | Nilanga | Niphad | Omerga | Osmanabad | Pachora | Paithan | Palghar | Pali | Pandharkawada | Pandharpur | Panhala | Paranda | Parbhani | Parner | Parola | Parseoni | Partur | Patan | Pathardi | Pathari | Patoda | Pauni | Peint | Pen | Phaltan | Pimpalner | Pirangut | Poladpur | Pune | Pusad | Pusegaon | Radhanagar | Rahuri | Raigad | Rajapur | Rajgurunagar | Rajura | Ralegaon | Ramtek | Ratnagiri | Raver | Risod | Roha | Sakarwadi | Sakoli | Sakri | Salekasa | Samudrapur | Sangamner | Sanganeshwar | Sangli | Sangola | Sanguem | Saoner | Saswad | Satana | Satara | Sawantwadi | Seloo | Shahada | Shahapur | Shahuwadi | Shevgaon | Shirala | Shirol | Shirpur | Shirur | Shirwal | Sholapur | Shri Rampur | Shrigonda | Shrivardhan | Sillod | Sinderwahi | Sindhudurg | Sindkheda | Sindkhedaraja | Sinnar | Sironcha | Soyegaon | Surgena | Talasari | Talegaon S.Ji Pant | Taloda | Tasgaon | Thane | Tirora | Tiwasa | Trimbak | Tuljapur | Tumsar | Udgir | Umarkhed | Umrane | Umrer | Urlikanchan | Vaduj | Velhe | Vengurla | Vijapur | Vita | Wada | Wai | Walchandnagar | Wani | Wardha | Warlydwarud | Warora | Washim | Wathar | Yavatmal | Yawal | Yeola | Yeotmal ";
    s_a[22] = " Bishnupur | Chakpikarong | Chandel | Chattrik | Churachandpur | Imphal | Jiribam | Kakching | Kalapahar | Mao | Mulam | Parbung | Sadarhills | Saibom | Sempang | Senapati | Sochumer | Taloulong | Tamenglong | Thinghat | Thoubal | Ukhrul ";
    s_a[23] = " Amlaren | Baghmara | Cherrapunjee | Dadengiri | Garo Hills | Jaintia Hills | Jowai | Khasi Hills | Khliehriat | Mariang | Mawkyrwat | Nongpoh | Nongstoin | Resubelpara | Ri Bhoi | Shillong | Tura | Williamnagar";
    s_a[24] = " Aizawl | Champhai | Demagiri | Kolasib | Lawngtlai | Lunglei | Mamit | Saiha | Serchhip";
    s_a[25] = " Dimapur | Jalukie | Kiphire | Kohima | Mokokchung | Mon | Phek | Tuensang | Wokha | Zunheboto ";
    s_a[26] = " Anandapur | Angul | Anugul | Aska | Athgarh | Athmallik | Attabira | Bagdihi | Balangir | Balasore | Baleswar | Baliguda | Balugaon | Banaigarh | Bangiriposi | Barbil | Bargarh | Baripada | Barkot | Basta | Berhampur | Betanati | Bhadrak | Bhanjanagar | Bhawanipatna | Bhubaneswar | Birmaharajpur | Bisam Cuttack | Boriguma | Boudh | Buguda | Chandbali | Chhatrapur | Chhendipada | Cuttack | Daringbadi | Daspalla | Deodgarh | Deogarh | Dhanmandal | Dharamgarh | Dhenkanal | Digapahandi | Dunguripali | G. Udayagiri | Gajapati | Ganjam | Ghatgaon | Gudari | Gunupur | Hemgiri | Hindol | Jagatsinghapur | Jajpur | Jamankira | Jashipur | Jayapatna | Jeypur | Jharigan | Jharsuguda | Jujumura | Kalahandi | Kalimela | Kamakhyanagar | Kandhamal | Kantabhanji | Kantamal | Karanjia | Kashipur | Kendrapara | Kendujhar | Keonjhar | Khalikote | Khordha | Khurda | Komana | Koraput | Kotagarh | Kuchinda | Lahunipara | Laxmipur | M. Rampur | Malkangiri | Mathili | Mayurbhanj | Mohana | Motu | Nabarangapur | Naktideul | Nandapur | Narlaroad | Narsinghpur | Nayagarh | Nimapara | Nowparatan | Nowrangapur | Nuapada | Padampur | Paikamal | Palla Hara | Papadhandi | Parajang | Pardip | Parlakhemundi | Patnagarh | Pattamundai | Phiringia | Phulbani | Puri | Puruna Katak | R. Udayigiri | Rairakhol | Rairangpur | Rajgangpur | Rajkhariar | Rayagada | Rourkela | Sambalpur | Sohela | Sonapur | Soro | Subarnapur | Sunabeda | Sundergarh | Surada | T. Rampur | Talcher | Telkoi | Titlagarh | Tumudibandha | Udala | Umerkote ";
    s_a[27] = " Bahur | Karaikal | Mahe | Pondicherry | Purnankuppam | Valudavur | Villianur | Yanam ";
    s_a[28] = " Abohar | Ajnala | Amritsar | Balachaur | Barnala | Batala | Bathinda | Chandigarh | Dasua | Dinanagar | Faridkot | Fatehgarh Sahib | Fazilka | Ferozepur | Garhashanker | Goindwal | Gurdaspur | Guruharsahai | Hoshiarpur | Jagraon | Jalandhar | Jugial | Kapurthala | Kharar | Kotkapura | Ludhiana | Malaut | Malerkotla | Mansa | Moga | Muktasar | Nabha | Nakodar | Nangal | Nawanshahar | Nawanshahr | Pathankot | Patiala | Patti | Phagwara | Phillaur | Phulmandi | Quadian | Rajpura | Raman | Rayya | Ropar | Rupnagar | Samana | Samrala | Sangrur | Sardulgarh | Sarhind | SAS Nagar | Sultanpur Lodhi | Sunam | Tanda Urmar | Tarn Taran | Zira ";
    s_a[29] = " Abu Road | Ahore | Ajmer | Aklera | Alwar | Amber | Amet | Anupgarh | Asind | Aspur | Atru | Bagidora | Bali | Bamanwas | Banera | Bansur | Banswara | Baran | Bari | Barisadri | Barmer | Baseri | Bassi | Baswa | Bayana | Beawar | Begun | Behror | Bhadra | Bharatpur | Bhilwara | Bhim | Bhinmal | Bikaner | Bilara | Bundi | Chhabra | Chhipaborad | Chirawa | Chittorgarh | Chohtan | Churu | Dantaramgarh | Dausa | Deedwana | Deeg | Degana | Deogarh | Deoli | Desuri | Dhariawad | Dholpur | Digod | Dudu | Dungarpur | Dungla | Fatehpur | Gangapur | Gangdhar | Gerhi | Ghatol | Girwa | Gogunda | Hanumangarh | Hindaun | Hindoli | Hurda | Jahazpur | Jaipur | Jaisalmer | Jalore | Jhalawar | Jhunjhunu | Jodhpur | Kaman | Kapasan | Karauli | Kekri | Keshoraipatan | Khandar | Kherwara | Khetri | Kishanganj | Kishangarh | Kishangarhbas | Kolayat | Kota | Kotputli | Kotra | Kotri | Kumbalgarh | Kushalgarh | Ladnun | Ladpura | Lalsot | Laxmangarh | Lunkaransar | Mahuwa | Malpura | Malvi | Mandal | Mandalgarh | Mandawar | Mangrol | Marwar-Jn | Merta | Nadbai | Nagaur | Nainwa | Nasirabad | Nathdwara | Nawa | Neem Ka Thana | Newai | Nimbahera | Nohar | Nokha | Onli | Osian | Pachpadara | Pachpahar | Padampur | Pali | Parbatsar | Phagi | Phalodi | Pilani | Pindwara | Pipalda | Pirawa | Pokaran | Pratapgarh | Raipur | Raisinghnagar | Rajgarh | Rajsamand | Ramganj Mandi | Ramgarh | Rashmi | Ratangarh | Reodar | Rupbas | Sadulshahar | Sagwara | Sahabad | Salumber | Sanchore | Sangaria | Sangod | Sapotra | Sarada | Sardarshahar | Sarwar | Sawai Madhopur | Shahapura | Sheo | Sheoganj | Shergarh | Sikar | Sirohi | Siwana | Sojat | Sri Dungargarh | Sri Ganganagar | Sri Karanpur | Sri Madhopur | Sujangarh | Taranagar | Thanaghazi | Tibbi | Tijara | Todaraisingh | Tonk | Udaipur | Udaipurwati | Uniayara | Vallabhnagar | Viratnagar ";
    s_a[30] = " Barmiak | Be | Bhurtuk | Chhubakha | Chidam | Chubha | Chumikteng | Dentam | Dikchu | Dzongri | Gangtok | Gauzing | Gyalshing | Hema | Kerung | Lachen | Lachung | Lema | Lingtam | Lungthu | Mangan | Namchi | Namthang | Nanga | Nantang | Naya Bazar | Padamachen | Pakhyong | Pemayangtse | Phensang | Rangli | Rinchingpong | Sakyong | Samdong | Singtam | Siniolchu | Sombari | Soreng | Sosing | Tekhug | Temi | Tsetang | Tsomgo | Tumlong | Yangang | Yumtang ";
    s_a[31] = " Ambasamudram | Anamali | Arakandanallur | Arantangi | Aravakurichi | Ariyalur | Arkonam | Arni | Aruppukottai | Attur | Avanashi | Batlagundu | Bhavani | Chengalpattu | Chengam | Chennai | Chidambaram | Chingleput | Coimbatore | Courtallam | Cuddalore | Cumbum | Denkanikoitah | Devakottai | Dharampuram | Dharmapuri | Dindigul | Erode | Gingee | Gobichettipalayam | Gudalur | Gudiyatham | Harur | Hosur | Jayamkondan | Kallkurichi | Kanchipuram | Kangayam | Kanyakumari | Karaikal | Karaikudi | Karur | Keeranur | Kodaikanal | Kodumudi | Kotagiri | Kovilpatti | Krishnagiri | Kulithalai | Kumbakonam | Kuzhithurai | Madurai | Madurantgam | Manamadurai | Manaparai | Mannargudi | Mayiladuthurai | Mayiladutjurai | Mettupalayam | Metturdam | Mudukulathur | Mulanur | Musiri | Nagapattinam | Nagarcoil | Namakkal | Nanguneri | Natham | Neyveli | Nilgiris | Oddanchatram | Omalpur | Ootacamund | Ooty | Orathanad | Palacode | Palani | Palladum | Papanasam | Paramakudi | Pattukottai | Perambalur | Perundurai | Pollachi | Polur | Pondicherry | Ponnamaravathi | Ponneri | Pudukkottai | Rajapalayam | Ramanathapuram | Rameshwaram | Ranipet | Rasipuram | Salem | Sankagiri | Sankaran | Sathiyamangalam | Sivaganga | Sivakasi | Sriperumpudur | Srivaikundam | Tenkasi | Thanjavur | Theni | Thirumanglam | Thiruraipoondi | Thoothukudi | Thuraiyure | Tindivanam | Tiruchendur | Tiruchengode | Tiruchirappalli | Tirunelvelli | Tirupathur | Tirupur | Tiruttani | Tiruvallur | Tiruvannamalai | Tiruvarur | Tiruvellore | Tiruvettipuram | Trichy | Tuticorin | Udumalpet | Ulundurpet | Usiliampatti | Uthangarai | Valapady | Valliyoor | Vaniyambadi | Vedasandur | Vellore | Velur | Vilathikulam | Villupuram | Virudhachalam | Virudhunagar | Wandiwash | Yercaud ";
    s_a[32] = " Agartala | Ambasa | Bampurbari | Belonia | Dhalai | Dharam Nagar | Kailashahar | Kamal Krishnabari | Khopaiyapara | Khowai | Phuldungsei | Radha Kishore Pur | Tripura ";
    s_a[33] = " Achhnera | Agra | Akbarpur | Aliganj | Aligarh | Allahabad | Ambedkar Nagar | Amethi | Amiliya | Amroha | Anola | Atrauli | Auraiya | Azamgarh | Baberu | Badaun | Baghpat | Bagpat | Baheri | Bahraich | Ballia | Balrampur | Banda | Bansdeeh | Bansgaon | Bansi | Barabanki | Bareilly | Basti | Bhadohi | Bharthana | Bharwari | Bhogaon | Bhognipur | Bidhuna | Bijnore | Bikapur | Bilari | Bilgram | Bilhaur | Bindki | Bisalpur | Bisauli | Biswan | Budaun | Budhana | Bulandshahar | Bulandshahr | Capianganj | Chakia | Chandauli | Charkhari | Chhata | Chhibramau | Chirgaon | Chitrakoot | Chunur | Dadri | Dalmau | Dataganj | Debai | Deoband | Deoria | Derapur | Dhampur | Domariyaganj | Dudhi | Etah | Etawah | Faizabad | Farrukhabad | Fatehpur | Firozabad | Garauth | Garhmukteshwar | Gautam Buddha Nagar | Ghatampur | Ghaziabad | Ghazipur | Ghosi | Gonda | Gorakhpur | Gunnaur | Haidergarh | Hamirpur | Hapur | Hardoi | Harraiya | Hasanganj | Hasanpur | Hathras | Jalalabad | Jalaun | Jalesar | Jansath | Jarar | Jasrana | Jaunpur | Jhansi | Jyotiba Phule Nagar | Kadipur | Kaimganj | Kairana | Kaisarganj | Kalpi | Kannauj | Kanpur | Karchhana | Karhal | Karvi | Kasganj | Kaushambi | Kerakat | Khaga | Khair | Khalilabad | Kheri | Konch | Kumaon | Kunda | Kushinagar | Lalganj | Lalitpur | Lucknow | Machlishahar | Maharajganj | Mahoba | Mainpuri | Malihabad | Mariyahu | Math | Mathura | Mau | Maudaha | Maunathbhanjan | Mauranipur | Mawana | Meerut | Mehraun | Meja | Mirzapur | Misrikh | Modinagar | Mohamdabad | Mohamdi | Moradabad | Musafirkhana | Muzaffarnagar | Nagina | Najibabad | Nakur | Nanpara | Naraini | Naugarh | Nawabganj | Nighasan | Noida | Orai | Padrauna | Pahasu | Patti | Pharenda | Phoolpur | Phulpur | Pilibhit | Pitamberpur | Powayan | Pratapgarh | Puranpur | Purwa | Raibareli | Rampur | Ramsanehi Ghat | Rasara | Rath | Robertsganj | Sadabad | Safipur | Sagri | Saharanpur | Sahaswan | Sahjahanpur | Saidpur | Salempur | Salon | Sambhal | Sandila | Sant Kabir Nagar | Sant Ravidas Nagar | Sardhana | Shahabad | Shahganj | Shahjahanpur | Shikohabad | Shravasti | Siddharthnagar | Sidhauli | Sikandra Rao | Sikandrabad | Sitapur | Siyana | Sonbhadra | Soraon | Sultanpur | Tanda | Tarabganj | Tilhar | Unnao | Utraula | Varanasi | Zamania ";
    s_a[34] = " Almora | Bageshwar | Bhatwari | Chakrata | Chamoli | Champawat | Dehradun | Deoprayag | Dharchula | Dunda | Haldwani | Haridwar | Joshimath | Karan Prayag | Kashipur | Khatima | Kichha | Lansdown | Munsiari | Mussoorie | Nainital | Pantnagar | Partapnagar | Pauri Garhwal | Pithoragarh | Purola | Rajgarh | Ranikhet | Roorkee | Rudraprayag | Tehri Garhwal | Udham Singh Nagar | Ukhimath | Uttarkashi ";
    s_a[35] = " Adra | Alipurduar | Amlagora | Arambagh | Asansol | Balurghat | Bankura | Bardhaman | Basirhat | Berhampur | Bethuadahari | Birbhum | Birpara | Bishanpur | Bolpur | Bongoan | Bulbulchandi | Burdwan | Calcutta | Canning | Champadanga | Contai | Cooch Behar | Daimond Harbour | Dalkhola | Dantan | Darjeeling | Dhaniakhali | Dhuliyan | Dinajpur | Dinhata | Durgapur | Gangajalghati | Gangarampur | Ghatal | Guskara | Habra | Haldia | Harirampur | Harishchandrapur | Hooghly | Howrah | Islampur | Jagatballavpur | Jalpaiguri | Jhalda | Jhargram | Kakdwip | Kalchini | Kalimpong | Kalna | Kandi | Karimpur | Katwa | Kharagpur | Khatra | Krishnanagar | Mal Bazar | Malda | Manbazar | Mathabhanga | Medinipur | Mekhliganj | Mirzapur | Murshidabad | Nadia | Nagarakata | Nalhati | Nayagarh | Parganas | Purulia | Raiganj | Rampur Hat | Ranaghat | Seharabazar | Siliguri | Suri | Takipur | Tamluk";

    console.log(s_a[1]);
    res.json(s_a);
});

app.get("/state", (req, res) => {
    var state_arr = new Array("Andaman & Nicobar", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra & Nagar Haveli", "Daman & Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Orissa", "Pondicherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Tripura", "Uttar Pradesh", "Uttaranchal", "West Bengal");
    res.json(state_arr);
});

app.get("/Dashboard/ajaxform", (req, res) => {
    res.render("ajaxform");
});


app.get("/ajaxdatainsert", AuthMiddle, (req, res) => {
    let data = [{}], data3 = [{}], data2 = [{}], data4 = [{}], data7 = [{}], data6 = [{}], data5 = [{}];
    res.render("jobform", { data, data2, data4, data7, data6, data5, data3 });
});

app.get("/ajaxupdatedata", AuthMiddle, async (req, res) => {
    let id = req.query.id || 1;
    let query1 = ` select * , DATE_FORMAT(dateofbirth, "%Y-%m-%d") as dateofbirth  from basic_details where employee_id = ${id}`;
    let query2 = `select * from education where id=${id}`;
    let query3 = `select * from language_known where id=${id}`;
    let query4 = `select * from technology_known_master where id=${id}`;
    let query5 = `select * , DATE_FORMAT(startdate, "%Y-%m-%d")as startdate , DATE_FORMAT(enddate, "%Y-%m-%d")as enddate from work_experience where id=${id}`;
    let query6 = `select * from referencecontact where id=${id}`;
    let query7 = `select * from preference where id=${id}`;
    let result1 = await ExecuteData(query1);
    let result2 = await ExecuteData(query2);
    let result3 = await ExecuteData(query3);
    let result4 = await ExecuteData(query4);
    let result5 = await ExecuteData(query5);
    let result6 = await ExecuteData(query6);
    let result7 = await ExecuteData(query7);
    if (result1.length == 0) {
        result1 = [{}];
    }
    if (result7.length == 0) {
        result7 = [{}];
    }
    // console.log(result4);
    // console.log(result5);
    res.render("jobform", { data: result1, data2: result2, data3: result7, data4: result5, data5: result6, data6: result4, data7: result3 });
});

app.post("/ajaxdatasave", async (req, res) => {

    console.log(req.body);
    try {
        let data = req.body;
        console.log(data);
        let id = data.empid;
        // console.log(id);
        let query1 = `update basic_details set first_name= '${data.firstname}' , last_name= '${data.lastname}', email='${data.email}' , designation=
          '${data.designation1}' ,city ='${data.city}' , dateofbirth= '${data.dateofbirth}' ,state ='${data.state}' ,address1='${data.address1}',address2='${data.address2}',relationshipstatus='${data.rstatus}',xender='${data.gender}',zipcode='${data.zipcode}' where employee_id=${id}`;
        // console.log(query1);
        await ExecuteData(query1);

        for (let i = 0; i < data.board.length; i++) {
            let edu_main = data.eduid[i] || 0;
            console.log(edu_main);
            if (edu_main) {
                console.log('inside update')
                let query2 = `update education set coursename='${data.board[i]}',yearofpassing=${data.year[i]},percentage=${data.marks[i]} where id=${id} and edu_id=${data.eduid[i]}`;
                // console.log(query2);
                await ExecuteData(query2);
            }
            else {
                let query2 = `insert into education(id,coursename,yearofpassing,percentage) values(${id},'${data.board[i]}',${data.year[i]},${data.marks[i]})`;
                // console.log(query2);
                await ExecuteData(query2);
            }
        }

        if (data.hindi) {
            let canread = data.hindiread || 0;
            let canwrite = data.hindiwrite || 0;
            let canspeak = data.hindispeak || 0;
            let query6 = `update language_known set languageknown='${data.hindi}',canread=${canread},canwrite=${canwrite},canspeak=${canspeak} where id=${id} and languageknown='${data.hindi}'`;
            // console.log(query6);
            await ExecuteData(query6);
        }
        if (data.english) {

            let canread = data.englishread || 0;
            let canwrite = data.englishwrite || 0;
            let canspeak = data.englishspeak || 0;

            let query7 = `update language_known set languageknown='${data.english}',canread=${canread},canwrite=${canwrite},canspeak=${canspeak} where id=${id} and languageknown='${data.english}'`;
            // console.log(query7);
            await ExecuteData(query7);
        }

        if (data.gujarati) {

            let canread = data.gujratiread || 0;
            let canwrite = data.gujratiwrite || 0;
            let canspeak = data.gujratispeak || 0;

            let query8 = `update language_known set languageknown='${data.gujarati}',canread=${canread},canwrite=${canwrite},canspeak=${canspeak} where id=${id} and languageknown='${data.gujarati}'`;

            console.log(query8);
            await ExecuteData(query8);
        }

        let technology = [];
        let level = [];
        technology.push(data.phptech || 0)
        technology.push(data.mysqltech || 0)
        technology.push(data.laraveltech || 0)
        technology.push(data.oracletech || 0)

        level.push(data.php || 0)
        level.push(data.mysql || 0)
        level.push(data.laravel || 0)
        level.push(data.oracle || 0)
        // console.log(technology);
        // console.log(level);
        for (let i = 0; i < 4; i++) {
            if (technology[i]) {
                let query9 = `update  technology_known_master set technologyknown='${technology[i]}',level='${level[i]}' where id=${id} and technologyknown='${technology[i]}'`;
                // console.log(query9);
                await ExecuteData(query9);
            }
        }
        let query10 = `update preference set  preferedlocation='${data.preferedlocation}',noticeperiod='${data.noticeperiod}',expectedctc=${data.expectedctc},currentctc=${data.currentctc},department='${data.department}' where id=${id}`;
        console.log(query10);
        await ExecuteData(query10);

        for (let i = 0; i < data.refname.length; i++) {
            if (data.refid[i]) {
                let query11 = `update  referencecontact set  personname='${data.refname[i]}',contactnumber='${data.refnumber[i]}',relationship='${data.refrelation[i]}' where id=${id} and ref_id=${data.refid[i]}`;
                console.log(query11);
                await ExecuteData(query11);
            }
            else if (!data.refname[i] == "") {
                let query11 = `insert into  referencecontact(id,personname,contactnumber,relationship) values(${id},'${data.refname[i]}','${data.refnumber[i]}','${data.refrelation[i]}')`;
                console.log(query11);
                await ExecuteData(query11);
            }
        }


        for (let i = 0; i < data.companyname.length; i++) {
            if (data.workid[i]) {

                let query13 = `update  work_experience set companyname ='${data.companyname[i]}',designation='${data.designation2[i]}',startdate='${data.from[i]}',enddate='${data.to[i]}' where id=${id} and exper_id=${data.workid[i]}`;
                console.log(query13);
                await ExecuteData(query13);
            }
            else if (!data.companyname[i] == "") {
                let query13 = `insert into  work_experience(id,companyname ,designation,startdate ,enddate) values(${id},'${data.companyname[i]}','${data.designation2[i]}','${data.from[i]}','${data.to[i]}')`;
                // console.log(query13);
                await ExecuteData(query13);
            }
        }


    }
    catch (err) {
        console.log(err);
    }
});

app.get("/ajaxupdate", AuthMiddle, async (req, res) => {
    let query = `select * from basic_details`;
    let data = await ExecuteData(query);
    res.render("ajaxupdatelist", { data });
});

app.post("/ajaxinsert", async (req, res) => {

    // let formdata = req.body;
    // let data = req.body;
    console.log(req.body);
    // let data = [{}], data2 = [{}], data4 = [{}], data7 = [{}], data6 = [{}], data5 = [{}];
    // res.render("jobform", { data, data2, data4, data7, data6, data5 })


    try {
        // res.render("save");
        let data = req.body;
        // console.log(data);


        let query1 = `insert into basic_details(first_name,last_name,email,designation,address1,address2,city,state,phonenumber,zipcode,xender,dateofbirth,relationshipstatus) values ('${data.firstname}','${data.lastname}','${data.email}','${data.designation1}','${data.address1}','${data.address2}','${data.city}','${data.state}',
         '${data.phonenumber}','${data.zipcode}','${data.gender}','${data.dateofbirth}','${data.rstatus}')`;
        let result = await ExecuteData(query1);
        let id = result.insertId;
        console.log(query1);
        console.log(id);
        // let id = 5;
        console.log(data.board);
        for (let i = 0; i < data.board.length; i++) {
            if (data.board[i]) {
                let query2 = `insert into education(id,coursename,yearofpassing,percentage) values(${id},'${data.board[i]}',${data.year[i]},${data.marks[i]})`;
                // console.log(query2);
                await ExecuteData(query2);
            }
        }


        if (data.hindi) {
            let canread = data.hindiread || 0;
            let canwrite = data.hindiwrite || 0;
            let canspeak = data.hindispeak || 0;
            let query6 = `insert into language_known(id,languageknown,canread,canwrite,canspeak) values(${id},'${data.hindi}',${canread},${canwrite},${canspeak})`;
            // console.log(query6);
            await ExecuteData(query6);
        }
        if (data.english) {

            let canread = data.englishread || 0;
            let canwrite = data.englishwrite || 0;
            let canspeak = data.englishspeak || 0;

            let query7 = `insert into language_known(id,languageknown,canread,canwrite,canspeak) values(${id},'${data.english}',${canread},${canwrite},${canspeak})`;
            // console.log(query7);
            await ExecuteData(query7);
        }

        if (data.gujarati) {

            let canread = data.gujratiread || 0;
            let canwrite = data.gujratiwrite || 0;
            let canspeak = data.gujratispeak || 0;

            let query8 = `insert into language_known(id,languageknown,canread,canwrite,canspeak) values(${id},'${data.gujarati}',${canread},${canwrite},${canspeak})`;
            // console.log(query8);
            await ExecuteData(query8);
        }
        let technology = [];
        let level = [];
        technology.push(data.phptech || 0)
        technology.push(data.mysqltech || 0)
        technology.push(data.laraveltech || 0)
        technology.push(data.oracletech || 0)

        level.push(data.php || 0)
        level.push(data.mysql || 0)
        level.push(data.laravel || 0)
        level.push(data.oracle || 0)
        // console.log(technology);
        // console.log(level);
        for (let i = 0; i < 4; i++) {
            if (technology[i]) {
                let query9 = `insert into technology_known_master(id,technologyknown,level) value(${id},'${technology[i]}','${level[i]}')`;
                // console.log(query9);
                await ExecuteData(query9);
            }
        }

        let query10 = `insert into preference(id,preferedlocation,noticeperiod,expectedctc,currentctc,department) values (${id},'${data.preferedlocation}','${data.noticeperiod}',${data.expectedctc},${data.currentctc},'${data.department}')`;
        await ExecuteData(query10);
        // console.log(query10);
        for (let i = 0; i <= data.refname.length; i++) {


            if (data.refname[i]) {
                let query11 = `insert into  referencecontact(id,personname,contactnumber,relationship) values(${id},'${data.refname[i]}','${data.refnumber[i]}','${data.refrelation[i]}')`;
                // console.log(query11);
                await ExecuteData(query11);
            }
        }


        for (let i = 0; i < data.companyname.length; i++) {
            if (data.companyname[i]) {

                let query13 = `insert into  work_experience(id,companyname ,designation,startdate ,enddate) values(${id},'${data.companyname[i]}','${data.designation2[i]}','${data.from[i]}','${data.to[i]}')`;
                // console.log(query13);
                await ExecuteData(query13);
            }
        }


    }
    catch (err) {
        console.log(err);
    }
    res.send({});
});

app.get("/Dashboard/postapi", AuthMiddle, (req, res) => {
    res.render("postapi")
});

app.get("/post", (req, res) => {
    try {
        res.render("post")
    } catch (err) {
        console.log(err);
    }
});

app.get("/postdetails/:id", (req, res) => {
    try {
        res.render("postdetails");
    } catch (err) {
        console.log(err);
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