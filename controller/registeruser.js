const { ExecuteData } = require("../connection");
const md5 = require("md5")


exports.registersave = async (req, res) => {
    try {
        let data = req.body;

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
    catch (err) {
        console.log(err);
    }
    // console.log(data);
    // console.log(hashedpwd);

};

exports.activeuser = async (req, res) => {
    try {
        let key = req.query.key;
        let id = req.query.id;

        let query = `select * from users where user_id=${id}`;
        let result = await ExecuteData(query);

        let createtime = result[0].time_stamp;
        let currenttime = new Date();

        let diff = currenttime - createtime;

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

};
