const { ExecuteData } = require("../../connection");


exports.ajaxupdate = async (req, res) => {
    try {
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
    }
    catch (err) {
        console.log(err);
    }

};
exports.ajaxupdatesave = async (req, res) => {
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

                await ExecuteData(query2);
            }
        }

        if (data.hindi) {
            let canread = data.hindiread || 0;
            let canwrite = data.hindiwrite || 0;
            let canspeak = data.hindispeak || 0;
            let query6 = `update language_known set languageknown='${data.hindi}',canread=${canread},canwrite=${canwrite},canspeak=${canspeak} where id=${id} and languageknown='${data.hindi}'`;

            await ExecuteData(query6);
        }
        if (data.english) {

            let canread = data.englishread || 0;
            let canwrite = data.englishwrite || 0;
            let canspeak = data.englishspeak || 0;

            let query7 = `update language_known set languageknown='${data.english}',canread=${canread},canwrite=${canwrite},canspeak=${canspeak} where id=${id} and languageknown='${data.english}'`;
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
        res.json('data updated');
    }
    catch (err) {
        console.log(err);
    }
};

exports.ajaxupdatelist = async (req, res) => {
    let query = `select * from basic_details`;
    let data = await ExecuteData(query);
    res.render("ajaxupdatelist", { data });
};