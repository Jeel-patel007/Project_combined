const mysql = require('../connection');





exports.displaindex = (req, res) => {

    res.clearCookie('token');
    res.render("index");

};

exports.registeriser = (req, res) => {
    let message = '';
    data = {};
    res.render("form", { message, data });
}