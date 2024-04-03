const { ExecuteData } = require("../connection");

exports.studentreport = async (req, res) => {
    try {
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

        let result = await ExecuteData(query);
        res.render("report", { data: result, l, month, year, order, column });
    }
    catch (err) {
        console.log(err);
    }

};

exports.studentresult = async (req, res) => {
    try {
        let l = parseInt(req.query.p);
        if (l < 1 || isNaN(l)) {
            l = 1;
        }
        if (l > 10) {
            l = 10;
        }
        let limit = 60;
        let offset = (Number(l) - 1) * limit;

        let res_query = `select s.id,s.firstname,sum(e.obtain_theorymarks) as ter_ob_the,sum(e.obtain_practicalmarks) as ter_ob_pre from student_master s
        inner join exam_master e
        on s.id = e.student_id 
        group by s.id,e.exam_type limit ${limit} offset ${offset}`;

        let result = await ExecuteData(res_query);
        // connection.query(res_query, function (err, result) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log("data fetched");
        //     }
        //     let arr = [];
        //     console.log(result.length);
        //     for (let i = 0; i < result.length; i += 3) {
        //         let sum = 0;
        //         for (let j = i; j < i + 3; j++) {
        //             let theorymarks = result[j].ter_ob_the;
        //             // console.log(theorymarks);
        //             let practicalmarks = result[j].ter_ob_pre;
        //             // console.log(practicalmarks);
        //             sum += theorymarks + practicalmarks;
        //         }
        //         arr.push(sum);
        //     }
        //     let count = 0;
        //     // console.log(arr);
        //     res.render("result", { l, data: result, arr, count });
        // });
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


        res.render("result", { l, data: result, arr, count });
    }
    catch (err) {

    }

};

exports.resultdetails = async (req, res) => {
    try {
        let id = req.query.id;

        console.log(req.query);
        console.log(id);
        let query3 = `select s.id, s.firstname ,e.sub_id,e.exam_type, k.sub_name,e.obtain_theorymarks ,e.obtain_practicalmarks from student_master s 
        left join exam_master e on  s.id= e.student_id 
        left join subject_master k on e.sub_id = k.sub_id
           where s.id=${id}`;

        let query4 = `  select count(studentid)as atten from attendence_master where stu_status="present" and studentid=${id}`;
        let result = await ExecuteData(query3);
        let result2 = await ExecuteData(query4);


        res.render("resultdetails", { data: result, atten: result2 });
    }
    catch (err) {
        console.log(err);
    }

};