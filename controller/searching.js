const { ExecuteData } = require("../connection");

exports.searching = async (req, res) => {
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
        let result = await ExecuteData(query);

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

        let result2 = await ExecuteData(query2);

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
        // connection.query(query, function (err, result) {
        //     // if error then
        //     if (err) {
        //         console.log(err);
        //         res.render("serinvalid");
        //     } else {
        //         let l = req.query.p;

        //         if (l < 1 || isNaN(l)) {
        //             l = 1;
        //         }
        //         // setting limit to number of records per page
        //         let limit = 10;
        //         let page = Math.ceil(result.length / limit);
        //         let offset = (Number(l) - 1) * limit;
        //         if (l > page) {
        //             l = page;
        //         }

        //         let query2 = `select * from student_master  ${detail_query}limit ${limit} offset ${offset}`;
        //         // console.log(query2);
        //         connection.query(query2, function (err2, result2) {
        //             if (err2) {
        //                 console.log(err2);
        //                 res.render("invalid");
        //             } else {
        //                 res.render("orderby2", {
        //                     data: result2,
        //                     l,
        //                     id,
        //                     firstname,
        //                     option,
        //                     page,
        //                     profession,
        //                     country,
        //                 });
        //             }
        //         });
        //     }
        // });
    } catch (err) {
        console.log(err);
        res.render("serinvalid");
    }
};