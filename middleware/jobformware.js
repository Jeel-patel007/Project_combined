
module.exports = async function jobformware(req, res, next) {
    isValid = true;
    console.log('inside middleware');
    let data = req.body;
    console.log(data);
    let phoneno = /^\d{10}$/;
    let nameregex = /^[a-zA-Z\s]*$/;
    const regEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    let Values = Object.values(data);
    console.log(Values);

    Values.forEach((Element) => {
        console.log(Element);
        if (Element == "") {

            isValid = false;

        }
    });
    if (isValid == true) {
        next();
    }
    else {
        let message = "Please fill the require field";
        res.render("jobform", { message, data })
    }

}