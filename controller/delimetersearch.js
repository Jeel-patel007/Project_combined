const { ExecuteData } = require("../connection");

exports.delimeter = async (req, res) => {
    try {
        // let ini = 0;
        // fetching  user input from the req.query
        let displaystring = req.query.userstring;
        // console.log(displaystring);
        // if (displaystring.length == 0) {
        //   console.log("inside disply string");
        //   ini = 1;
        // }
        let userstring = req.query.userstring + "_";

        let array = [];
        //slice string on occurrence of special character and store it on the array.
        for (let i = 0; i < userstring.length; i++) {
            for (let j = i + 1; j < userstring.length; j++) {
                if (
                    userstring[j] == "_" ||
                    userstring[j] == "^" ||
                    userstring[j] == "$" ||
                    userstring[j] == "}" ||
                    userstring[j] == "{" ||
                    userstring[j] == ":"
                ) {
                    let arr = userstring.slice(i, j);
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
        let detailquery = " ";
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
            detailquery = "where " + arr.join(" and ");
            // on enter of valid data we will set it to the 1.
            // ini = 1;
        }
        // console.log(detailquery);

        //sql query to that will  run to mysql database.
        let query2 = `select * from student_master ${detailquery}`;
        let result2 = await ExecuteData(query2);
        // connection.query(query2, function (err2, result2) {
        //     if (err2) {
        //         console.log(err2);
        //         res.render("delinvalid");
        //     } else {
        //         res.render("delimeterorderby", {
        //             data: result2,
        //             userstring: displaystring,
        //         });
        //     }
        // });
        res.render("delimeterorderby", {
            data: result2,
            userstring: displaystring,
        });
    } catch (err) {
        console.log(err);
    }
};