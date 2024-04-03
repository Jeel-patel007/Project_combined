const { ExecuteData } = require("../../connection");



exports.ajaxform = (req, res) => {
    res.render("ajaxform");
};

exports.ajaxinsert = (req, res) => {
    let data = [{}], data3 = [{}], data2 = [{}], data4 = [{}], data7 = [{}], data6 = [{}], data5 = [{}];
    res.render("jobform", { data, data2, data4, data7, data6, data5, data3 });
};

exports.ajaxinsertsave = async (req, res) => {
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
    res.json('data inserted');
};