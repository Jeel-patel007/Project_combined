// middleware to check wheather user is loged in or not .


module.exports = function AuthMiddle(req, res, next) {
    // checking the cookie is present or not.
    if (req.cookies.token) {
        next();
    }
    else {
        res.render("login");
    }
}