
var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
    let url = window.location.href;
    var x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    // ... and fix the Previous/Next buttons:
    if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
    }
    if (n == (x.length - 1)) {
        document.getElementById("nextBtn").style.display = "none";
        if (url == 'http://localhost:8084/ajaxdatainsert') {
            document.getElementById("submit").style.display = "inline";
        }
        else {
            document.getElementById("update").style.display = "inline";
        }
    } else {
        document.getElementById("submit").style.display = "none";
        document.getElementById("update").style.display = "none";
        document.getElementById("nextBtn").style.display = "inline";
    }
    // ... and run a function that displays the correct step indicator:
    fixStepIndicator(n)
}
function nextPrev(n) {
    // This function will figure out which tab to display
    var x = document.getElementsByClassName("tab");
    // Exit the function if any field in the current tab is invalid:
    if (n == 1 && !validateForm(currentTab)) return false;
    // Hide the current tab:
    x[currentTab].style.display = "none";
    // Increase or decrease the current tab by 1:
    currentTab = currentTab + n;
    // if you have reached the end of the form... :
    // if (currentTab >= x.length) {
    //     //...the form gets submitted:
    //     document.getElementById("regForm").submit();
    //     return false;
    // }
    // Otherwise, display the correct tab:
    showTab(currentTab);
}



function fixStepIndicator(n) {
    // This function removes the "active" class of all steps...
    var i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    //... and adds the "active" class to the current step:
    x[n].className += " active";
}
async function SubmitForm() {
    // alert('hello jd')
    if (!validateForm(currentTab)) {
        return false;
    }

    let formData = document.getElementById("refForm");

    let details = new FormData(formData);
    const params = new URLSearchParams(details);
    const jobdata = await new Response(params).text();

    var result = 'firstname=jeel'
    console.log(typeof (result));

    let data = await fetch("http://localhost:8084/ajaxinsert", {
        method: "POST",
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        body: jobdata

    })
    console.log(data);


}
async function UpdateForm() {
    // alert('hello jd')
    if (!validateForm(currentTab)) {
        return false;
    }

    let formData = document.getElementById("refForm");

    let details = new FormData(formData);
    const params = new URLSearchParams(details);
    const jobdata = await new Response(params).text();

    var result = 'firstname=jeel'
    console.log(typeof (result));

    let data = await fetch("http://localhost:8084/ajaxdatasave", {
        method: "POST",
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        body: jobdata

    })
    console.log(data);


}

function addrow1() {
    let main_work = document.getElementsByClassName("edu-main")[0];
    let main_row = document.getElementsByClassName("edu-tr")[0];
    console.log(main_row);
    console.log(main_work);
    let column = main_row.cloneNode(true);
    main_work.appendChild(column);
}

function removerow1() {
    let main_work = document.getElementsByClassName("edu-main")[0];
    let rows = document.querySelectorAll(".edu-tr").length;

    if (rows > 1) {
        main_work.removeChild(main_work.lastElementChild);
    }
}

function AddWork() {
    let exper_work = document.getElementsByClassName("work-main")[0];
    let work_row = document.getElementsByClassName("work-row1")[0];
    let column = work_row.cloneNode(true);
    exper_work.appendChild(column);
}
function RemoveWork() {
    let exper_work = document.getElementsByClassName("work-main")[0];
    let rows = document.querySelectorAll(".work-row1").length;
    if (rows > 1) {
        console.log(exper_work);
        exper_work.removeChild(exper_work.lastElementChild);
    }
}
function Addref() {
    let ref_main = document.getElementsByClassName("ref-main")[0];
    let ref_row = document.getElementsByClassName("ref-row")[0];
    let column = ref_row.cloneNode(true);
    ref_main.appendChild(column);
}
function Removeref() {
    let ref_main = document.getElementsByClassName("ref-main")[0];
    let rows = document.querySelectorAll(".ref-row").length;
    console.log(rows);
    if (rows > 1) {
        console.log(ref_main);
        ref_main.removeChild(ref_main.lastElementChild);
    }
}


function validateForm(tabIndex) {
    var phoneno = /^\d{10}$/;
    const regEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    var namereg = /^[a-zA-Z\s]*$/;
    var datereg = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
    let isValid = true;
    Remerror();
    if (tabIndex == 0) {
        var require_field = document.getElementsByClassName("required1");
        // console.log(require_field[0].parentNode);
        for (const i of require_field) {
            if (i.value === "") {
                i.parentNode.innerHTML += `<span class="dynamic" > Required</span>`;
                isValid = false;
            }
        }
        var isChecked = document.querySelectorAll('input[name=gender]:checked');
        if (!isChecked.length) {
            var elem = document.getElementById("gender");
            elem.parentNode.innerHTML += `<span class="dynamic" > this field can't be empty</span>`;
            isValid = false;
        }
        let phoneValidate = document.getElementById("phonenumber").value;
        if (!(phoneValidate.match(phoneno))) {
            // document.getElementById("validphonenumber").innerHTML = ("enter valid phonenumber!");
            var elem = document.getElementById("phonenumber");
            elem.parentNode.innerHTML += `<span class="dynamic" > enter a valid mobileno </span>`;
            isValid = false;
        }

        let birthvalid = document.getElementById("dateofbirth").value;
        if (!birthvalid.match(datereg)) {
            var elem = document.getElementById("dateofbirth");
            elem.parentNode.innerHTML += `<span class="dynamic" > enter a valid date</span>`;
            isValid = false;
        }
        validateName("lastname")

        if (!validateName("firstname")) {
            isValid = false;
        }
        if (!validateName("designation1")) {
            isValid = false;
        }
        if (!validateName("city")) {
            isValid = false;
        }
        // if (!validateName("board1")) {
        //     isValid = false;
        // }
    }
    // console.log(tabIndex);

    if (tabIndex == 1) {
        // var require_field = document.getElementsByClassName("required3");
        // // console.log(require_field[0].parentNode);
        // for (const i of require_field) {
        //     if (i.value === "") {
        //         i.parentNode.innerHTML += `<span class="dynamic" > Required</span>`;
        //         isValid = false;
        //     }
        // }

        let boardvalid = document.getElementsByName("board[]");
        let yearvalid = document.getElementsByName("year[]");
        let marksvalid = document.getElementsByName("marks[]");
        let edu = [];
        let count = 0;
        console.log(yearvalid);
        for (let i = 0; i < boardvalid.length; i++) {
            edu.push(boardvalid[i]);
            edu.push(yearvalid[i]);
            edu.push(marksvalid[i]);
            console.log(edu);

            edu.forEach((element) => {
                if (element.value == "") {
                    count++;
                }
            });

            if (count == 1 || count == 2) {
                var elem = document.getElementById("edu_table_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill all the details</span>`;
                isValid = false;
            }
        }
    }
    if (tabIndex == 2) {

        let companyvalid = document.getElementsByName("companyname[]");
        let designationvalid = document.getElementsByName("designation2[]")
        let fromvalid = document.getElementsByName("from[]");
        let tovalid = document.getElementsByName("to[]");
        let work = [];
        let count = 0;
        // console.log(yearvalid);
        for (let i = 0; i < companyvalid.length; i++) {
            work.push(companyvalid[i]);
            work.push(designationvalid[i]);
            work.push(fromvalid[i]);
            work.push(tovalid[i]);
            // console.log(edu);

            work.forEach((element) => {
                if (element.value == "") {
                    count++;
                }
            });

            if (count == 1 || count == 2 || count == 3) {
                var elem = document.getElementById("work_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill all the details</span>`;
                isValid = false;
            }
        }
    }
    if (tabIndex == 5) {
        let refnamevalid = document.getElementsByName("refname[]");
        let refnumbervalid = document.getElementsByName("refnumber[]")
        let refrelation = document.getElementsByName("refrelation[]");
        let count = 0;
        let ref = [];
        for (let i = 0; i < refnamevalid.length; i++) {
            ref.push(refnamevalid[i]);
            ref.push(refnumbervalid[i]);
            ref.push(refrelation[i]);

            // console.log(edu);

            ref.forEach((element) => {
                if (element.value == "") {
                    count++;
                }
            });

            if (count == 1 || count == 2) {
                var elem = document.getElementById("ref_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill all the details</span>`;
                isValid = false;
            }
        }
    }
    if (tabIndex == 3) {
        // console.log('inside 3rd tab');
        let hindivalid = document.getElementById("hindi");
        let hindireadvalid = document.getElementById("hindiread");
        let hindiwritevalid = document.getElementById("hindiwrite");
        let hindispeakvalid = document.getElementById("hindispeak");
        let englishvalid = document.getElementById("english");
        let englishreadvalid = document.getElementById("englishread");
        let englishwritevalid = document.getElementById("englishwrite");
        let englishspeakvalid = document.getElementById("englishspeak");
        let gujrativalid = document.getElementById("gujarati");
        let gujratireadvalid = document.getElementById("gujratiread");
        let gujratiwritevalid = document.getElementById("gujratiwrite");
        let gujratispeakvalid = document.getElementById("gujratispeak");

        if (hindivalid.checked) {
            if (
                !(
                    hindireadvalid.checked ||
                    hindiwritevalid.checked ||
                    hindispeakvalid.checked
                )
            ) {
                console.log("inside if");
                var elem = document.getElementById("hindi");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any option</span>`;
                isValid = false;
            }
        }
        if (!hindivalid.checked) {
            if (
                hindireadvalid.checked ||
                hindiwritevalid.checked ||
                hindispeakvalid.checked
            ) {
                console.log("inside if");
                var elem = document.getElementById("hindi");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any language</span>`;
                isValid = false;
            }
        }
        if (englishvalid.checked) {
            if (
                !(
                    englishreadvalid.checked ||
                    englishwritevalid.checked ||
                    englishspeakvalid.checked
                )
            ) {
                console.log("inside if");
                var elem = document.getElementById("english");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any option</span>`;
                isValid = false;
            }
        }
        if (!englishvalid.checked) {
            if (
                englishreadvalid.checked ||
                englishwritevalid.checked ||
                englishspeakvalid.checked
            ) {
                console.log("inside if");
                var elem = document.getElementById("english");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any language</span>`;
                isValid = false;
            }
        }

        if (gujrativalid.checked) {
            if (
                !(
                    gujratireadvalid.checked ||
                    gujratiwritevalid.checked ||
                    gujratispeakvalid.checked
                )
            ) {
                console.log("inside if");
                var elem = document.getElementById("gujrati");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any option</span>`;
                isValid = false;
            }
        }
        if (!gujrativalid.checked) {
            if (
                gujratireadvalid.checked ||
                gujratiwritevalid.checked ||
                gujratispeakvalid.checked
            ) {
                console.log("inside if");
                var elem = document.getElementById("gujrati");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any language</span>`;
                isValid = false;
            }
        }
    }

    if (tabIndex == 4) {
        let phpvalid = document.getElementById("php");
        let phpbeginervalid = document.getElementById("phpbeginer");
        let phpmidetorvalid = document.getElementById("phpmidetor");
        let phpmastervalid = document.getElementById("phpmaster");
        let mysqlvalid = document.getElementById("mysql");
        let mysqlbeginervalid = document.getElementById("mysqlbeginer");
        let mysqlmidetorvalid = document.getElementById("mysqlmidetor");
        let mysqlmastervalid = document.getElementById("mysqlmaster");
        let laravelvalid = document.getElementById("laravel");
        let laravelbeginervalid = document.getElementById("laravelbeginer");
        let laravelmidetorvalid = document.getElementById("laravelmidetor");
        let laravelmastervalid = document.getElementById("laravelmaster");
        let oraclevalid = document.getElementById("oracle");
        let oraclebeginervalid = document.getElementById("oraclebeginer");
        let oraclemidetorvalid = document.getElementById("oraclemidetor");
        let oraclemastervalid = document.getElementById("oraclemaster");

        if (phpvalid.checked) {
            if (!(phpbeginervalid.checked || phpmidetorvalid.checked || phpmastervalid.checked)) {
                var elem = document.getElementById("php");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any option</span>`;
                isValid = false;
            }
        }

        if (!phpvalid.checked) {
            if ((phpbeginervalid.checked || phpmidetorvalid.checked || phpmastervalid.checked)) {
                var elem = document.getElementById("php");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any technology</span>`;
                isValid = false;
            }
        }


        if (mysqlvalid.checked) {
            if (!(mysqlbeginervalid.checked || mysqlmidetorvalid.checked || mysqlmastervalid.checked)) {
                var elem = document.getElementById("mysql");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any option</span>`;
                isValid = false;
            }
        }
        if (!mysqlvalid.checked) {
            if ((mysqlbeginervalid.checked || mysqlmidetorvalid.checked || mysqlmastervalid.checked)) {
                var elem = document.getElementById("mysql");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any technology</span>`;
                isValid = false;
            }
        }

        if (laravelvalid.checked) {
            if (!(laravelbeginervalid.checked || laravelmidetorvalid.checked || laravelmastervalid.checked)) {
                var elem = document.getElementById("laravel");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any option</span>`;
                isValid = false;
            }
        }
        if (!laravelvalid.checked) {
            if ((laravelbeginervalid.checked || laravelmidetorvalid.checked || laravelmastervalid.checked)) {
                var elem = document.getElementById("laravel");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any technology</span>`;
                isValid = false;
            }
        }
        if (oraclevalid.checked) {
            if (!(oraclebeginervalid.checked || oraclemidetorvalid.checked || oraclemastervalid.checked)) {
                var elem = document.getElementById("oracle");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any option</span>`;
                isValid = false;
            }
        }
        if (!oraclevalid.checked) {
            if ((oraclebeginervalid.checked || oraclemidetorvalid.checked || oraclemastervalid.checked)) {
                var elem = document.getElementById("oracle");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any technology</span>`;
                isValid = false;
            }
        }
    }

    if (tabIndex == 6) {
        var require_field = document.getElementsByClassName("required2");
        // console.log(require_field[0].parentNode);
        for (const i of require_field) {
            if (i.value === "") {
                i.parentNode.innerHTML += `<span class="dynamic" > Required</span>`;
                isValid = false;
            }
        }
    }

    // let marks1valid = document.getElementById("marks1");

    // //  let companyname1 = document.getElementById("companyname1");

    // let fromvalid = document.getElementById("from1").value;
    // let tovalid = document.getElementById("to1").value;
    // let passyearvalid = document.getElementById("year1").value;


    // if (isNaN(marks1valid.value) || (marks1valid.value < 0 || marks1valid.value > 100)) {
    //     var elem = document.getElementById("marks1");
    //     elem.parentNode.innerHTML += `<span class="dynamic" >please enter a valid percentage</span>`;
    //     isValid = false;
    // }






    // if (!(phoneValidate.match(phoneno))) {
    //     // document.getElementById("validphonenumber").innerHTML = ("enter valid phonenumber!");
    //     var elem = document.getElementById("phonenumber");
    //     elem.parentNode.innerHTML += `<span class="dynamic" > enter a valid mobileno </span>`;
    //     isValid = false;
    // }
    // if ((!phonerefValidate.match(phoneno) && phonerefValidate.length > 0)) {
    //     // document.getElementById("validphonenumber").innerHTML = ("enter valid phonenumber!");
    //     var elem = document.getElementById("refnumber1");
    //     elem.parentNode.innerHTML += `<span class="dynamic" > enter a valid mobileno </span>`;
    //     isValid = false;
    // }

    // if (!emailValidate.match(regEmail)) {
    //     var elem = document.getElementById("email");
    //     elem.parentNode.innerHTML += `<span class="dynamic" > enter a valid email</span>`;

    //     isValid = false;
    // }
    // if (!birthvalid.match(datereg)) {
    //     var elem = document.getElementById("dateofbirth");
    //     elem.parentNode.innerHTML += `<span class="dynamic" > enter a valid date</span>`;
    //     isValid = false;
    // }
    // if (!fromvalid.match(datereg)) {
    //     var elem = document.getElementById("fromerror");
    //     elem.parentNode.innerHTML += `<span class="dynamic" > enter a valid date</span>`;
    //     isValid = false;
    // }
    // if (!tovalid.match(datereg)) {
    //     var elem = document.getElementById("fromerror");
    //     elem.parentNode.innerHTML += `<span class="dynamic" > enter a valid date</span>`;
    //     isValid = false;
    // }
    // console.log(isValid);

    if (isValid) {
        document.getElementsByClassName("step")[currentTab].className += " finish";
    }
    // return the valid status

    return isValid;
}
function Remerror() {
    var dynamic_class = document.querySelectorAll(".dynamic");
    for (const i of dynamic_class) {
        i.remove();
    }
}

const validateName = (inputname) => {

    let inputfield = document.getElementById(inputname).value;
    // console.log(inputfield);
    let nameregex = /^[a-zA-Z\s]*$/;
    if (!nameregex.test(inputfield)) {
        var elem = document.getElementById(inputname);
        elem.parentNode.innerHTML += `<span class="dynamic" > enter a valid input</span>`
        // console.log('inside validate false');
        return isValid = false;
    }
    // console.log('inside validate true')
    return isValid = true;


}