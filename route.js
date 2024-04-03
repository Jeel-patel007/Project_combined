const express = require("express");
const ValidateMiddle = require("./middleware/middleware");
const AuthMiddle = require("./middleware/authware")
const { displaindex, registeriser } = require("./controller/pageindex");
const { registersave, activeuser } = require("./controller/registeruser");
const { loginuser, loginusersave } = require("./controller/loginuser");
const { forgotpassword, forgotsave, resetpassword } = require("./controller/forgotpassword");
const { dashboard, dynamictable, kukucube, tictaktoe, eventtable, mergesort } = require("./controller/dashboard");
const { listdata, orderby } = require("./controller/studentlist");
const { studentreport, studentresult, resultdetails } = require("./controller/studentresult");
const { searching } = require("./controller/searching");
const { delimeter } = require("./controller/delimetersearch");
const { ajaxstatecity, ajaxstate, ajaxcity } = require("./controller/ajaxstatecity");
const { ajaxform, ajaxinsert, ajaxinsertsave } = require("./controller/ajaxform/ajaxinsert");
const { ajaxupdatelist, ajaxupdate, ajaxupdatesave } = require("./controller/ajaxform/ajaxupdate");
const { postapi, posts, postdetails } = require("./controller/jsonplaceholder/post");

const router = express.Router();




router.route("/").get(displaindex);
router.route("/register").get(registeriser);
router.route("/save").post(ValidateMiddle, registersave);
router.route("/active").get(activeuser);
router.route("/login").get(loginuser);
router.route("/logsave").post(loginusersave);
router.route("/forgot").get(forgotpassword);
router.route("/forgotsave").post(forgotsave);
router.route("/resetpwd").post(resetpassword);
router.route("/Dashboard").get(AuthMiddle, dashboard);
router.route("/Dashboard/dynamictable").get(AuthMiddle, dynamictable);
router.route("/Dashboard/kukucube").get(AuthMiddle, kukucube);
router.route("/Dashboard/tiktactoe").get(AuthMiddle, tictaktoe);
router.route("/Dashboard/eventtable").get(AuthMiddle, eventtable);
router.route("/Dashboard/Mergesort").get(AuthMiddle, mergesort);
router.route("/listdatabase").get(AuthMiddle, listdata);
router.route("/Dashboard/orderby").get(AuthMiddle, orderby);
router.route("/report").get(AuthMiddle, studentreport);
router.route("/result").get(AuthMiddle, studentresult);
router.route("/resultdetails").get(AuthMiddle, resultdetails);
router.route("/Dashboard/searching").get(AuthMiddle, searching);
router.route("/Dashboard/delimetersearch").get(AuthMiddle, delimeter);
router.route("/Dashboard/statecity").get(AuthMiddle, ajaxstatecity);
router.route("/ajaxstatedata").get(AuthMiddle, ajaxcity);
router.route("/state").get(AuthMiddle, ajaxstate);
router.route("/Dashboard/ajaxform").get(AuthMiddle, ajaxform);
router.route("/ajaxdatainsert").get(AuthMiddle, ajaxinsert);
router.route("/ajaxinsert").post(AuthMiddle, ajaxinsertsave);
router.route("/ajaxupdate").get(AuthMiddle, ajaxupdatelist);
router.route("/ajaxupdatedata").get(AuthMiddle, ajaxupdate);
router.route("/ajaxdatasave").post(AuthMiddle, ajaxupdatesave);
router.route("/Dashboard/postapi").get(AuthMiddle, postapi);
router.route("/post").get(AuthMiddle, posts)
router.route("/postdetails/:id").get(AuthMiddle, postdetails);

module.exports = router;