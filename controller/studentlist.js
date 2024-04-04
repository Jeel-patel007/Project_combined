const { ExecuteData } = require("../connection");



exports.listdata = async (req, res) => {
    try {
        const totalposts = 50000;
        const perpage = 200;
        const pageCount = Math.ceil(totalposts / perpage);
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
        let offset = (page - 1) * perpage;

        let query = `select * from student_master1 limit ${perpage} offset ${offset}`;

        let result = await ExecuteData(query);
        res.render("listtask", { data: result, l: page });
    }
    catch (err) {
        console.log(err);
    }

};

exports.orderby = async (req, res) => {
    try {
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
        let result = await ExecuteData(query);
        res.render("orderby", { data: result, l, order, column });
    }
    catch (err) {
        console.log(err);
    }

};






