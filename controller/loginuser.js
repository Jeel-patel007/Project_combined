const { ExecuteData } = require("../connection");
const md5 = require("md5")
const jwt = require("jsonwebtoken");




exports.loginuser = (req, res) => {
    res.render("login");
};
exports.loginusersave = async (req, res) => {
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
        else if (result[0].isactive == 0) {
            res.status(404);
            res.json('your account is not activated');
        }
        else {
            let pwdhashed = md5(`${pwd}${result[0].salt}`);
            // console.log(pwdhashed);
            // console.log(pwd_main);

            if (pwdhashed != result[0].pwd) {
                res.status(404);
                res.json('invalid credential')
            }
            else {
                let jwtsecretkey = process.env.JWT_SECRET_KEY;
                let data = {
                    time: Date(),
                    userid: result[0].user_id
                }
                const token = jwt.sign(data, jwtsecretkey, { expiresIn: '1h' });
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
};