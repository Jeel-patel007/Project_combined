
let currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
    let url = window.location.href;
    let x = document.getElementsByClassName("tab");
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
    let x = document.getElementsByClassName("tab");
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
    let i, x = document.getElementsByClassName("step");
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

    let result = 'firstname=jeel'
    console.log(typeof (result));

    let data = await fetch("http://localhost:8084/ajaxinsert", {
        method: "POST",
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        body: jobdata

    })

    let dataresult = await data.json();
    console.log(dataresult);
    document.getElementById("message").innerText = 'data Inserted'

}
async function UpdateForm() {

    if (!validateForm(currentTab)) {
        return false;
    }

    let formData = document.getElementById("refForm");

    let details = new FormData(formData);
    const params = new URLSearchParams(details);
    const jobdata = await new Response(params).text();


    console.log(typeof (result));

    let data = await fetch("http://localhost:8084/ajaxdatasave", {
        method: "POST",
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        body: jobdata

    })
    let dataresult = await data.json();
    console.log(dataresult);
    document.getElementById("message").innerText = 'data updated'
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
    let phoneno = /^\d{10}$/;
    const regEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    let namereg = /^[a-zA-Z\s]*$/;
    let datereg = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
    let isValid = true;
    Remerror();

    if (tabIndex == 0) {
        let require_field = document.getElementsByClassName("required1");
        // console.log(require_field[0].parentNode);
        for (const i of require_field) {
            if (i.value === "") {
                i.parentNode.innerHTML += `<span class="dynamic" > Required</span>`;
                isValid = false;
            }
        }
        let isChecked = document.querySelectorAll('input[name=gender]:checked');
        if (!isChecked.length) {
            let elem = document.getElementById("gender");
            elem.parentNode.innerHTML += `<span class="dynamic" > this field can't be empty</span>`;
            isValid = false;
        }
        let phoneValidate = document.getElementById("phonenumber").value;
        if (!(phoneValidate.match(phoneno))) {
            // document.getElementById("validphonenumber").innerHTML = ("enter valid phonenumber!");
            let elem = document.getElementById("phonenumber");
            elem.parentNode.innerHTML += `<span class="dynamic" > enter a valid mobileno </span>`;
            isValid = false;
        }

        let birthvalid = document.getElementById("dateofbirth").value;
        let zipcodevalid = document.getElementById("zipcode").value;
        if ((zipcodevalid.length != 6) || isNaN(zipcodevalid)) {
            var elem = document.getElementById("zipcode");
            elem.parentNode.innerHTML += `<span class="dynamic" > enter a valid zipcode</span>`;
            isValid = false;
        }
        if (!birthvalid.match(datereg)) {
            let elem = document.getElementById("dateofbirth");
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

    }
    // console.log(tabIndex);

    if (tabIndex == 1) {

        let boardvalid = document.getElementsByName("board[]");
        let yearvalid = document.getElementsByName("year[]");
        let marksvalid = document.getElementsByName("marks[]");
        let edu = [];
        let count = 0;
        // console.log(yearvalid);
        for (let i = 0; i < boardvalid.length; i++) {
            edu.push(boardvalid[i]);
            edu.push(yearvalid[i]);
            edu.push(marksvalid[i]);
            // console.log(edu);

            edu.forEach((element) => {
                if (element.value == "") {
                    count++;
                }
            });

            if (count == 1 || count == 2) {
                let elem = document.getElementById("edu_table_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill all the details</span>`;
                isValid = false;
            }
        }
        let namereg = /^[a-zA-Z\s]*$/;
        boardvalid.forEach((element) => {
            console.log(element.value);
            if (!element.value.match(namereg)) {
                let elem = document.getElementById("edu_table_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill valid board name</span>`;
                isValid = false;
            }
        })

        yearvalid.forEach((element) => {
            if (element.value.length != 4 && isNaN(element.value)) {
                let elem = document.getElementById("edu_table_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill valid year</span>`;
                isValid = false;
            }
        })

        marksvalid.forEach((element) => {
            if ((element.value < 0 || element.value > 100) || isNaN(element.value)) {
                let elem = document.getElementById("edu_table_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill percentage</span>`;
                isValid = false;
            }
        })

    }
    if (tabIndex == 2) {

        let companyvalid = document.getElementsByName("companyname[]");
        let designationvalid = document.getElementsByName("designation2[]")
        let fromvalid = document.getElementsByName("from[]");
        let tovalid = document.getElementsByName("to[]");
        let work = [];
        let count = 0;

        for (let i = 0; i < companyvalid.length; i++) {
            work.push(companyvalid[i]);
            work.push(designationvalid[i]);
            work.push(fromvalid[i]);
            work.push(tovalid[i]);


            work.forEach((element) => {
                if (element.value == "") {
                    count++;
                }
            });

            if (count == 1 || count == 2 || count == 3) {
                let elem = document.getElementById("work_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill all the details</span>`;
                isValid = false;
            }
        }
        let datereg = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
        fromvalid.forEach((element) => {
            console.log(element.value);
            if (!element.value.match(datereg) && element.value != "") {
                console.log(element.value);
                let elem = document.getElementById("work_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill valid start date</span>`;
                isValid = false;
            }
        })
        tovalid.forEach((element) => {
            console.log(element.value);
            if (!element.value.match(datereg) && element.value != "") {
                let elem = document.getElementById("work_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill valid end date</span>`;
                isValid = false;
            }
        })


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

            ref.forEach((element) => {
                if (element.value == "") {
                    count++;
                }
            });

            if (count == 1 || count == 2) {
                let elem = document.getElementById("ref_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill all the details</span>`;
                isValid = false;
            }
        }

        let namereg = /^[a-zA-Z\s]*$/;
        refnamevalid.forEach((element) => {
            // console.log(element.value);
            if (!element.value.match(namereg)) {
                let elem = document.getElementById("ref_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill valid reference name</span>`;
                isValid = false;
            }
        })
        refrelation.forEach((element) => {
            // console.log(element.value);
            if (!element.value.match(namereg)) {
                let elem = document.getElementById("ref_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill valid relation name</span>`;
                isValid = false;
            }
        })

        let phoneno = /^\d{10}$/;
        refnumbervalid.forEach((element) => {
            if (!element.value.match(phoneno)) {
                let elem = document.getElementById("ref_error");
                elem.parentNode.innerHTML += `<span class="dynamic" >please fill valid contanct number</span>`;
                isValid = false;
            }
        })
    }
    if (tabIndex == 3) {

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
                let elem = document.getElementById("hindi");
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
                let elem = document.getElementById("hindi");
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
                let elem = document.getElementById("english");
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
                let elem = document.getElementById("english");
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
                let elem = document.getElementById("gujrati");
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
                let elem = document.getElementById("gujrati");
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
                let elem = document.getElementById("php");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any option</span>`;
                isValid = false;
            }
        }

        if (!phpvalid.checked) {
            if ((phpbeginervalid.checked || phpmidetorvalid.checked || phpmastervalid.checked)) {
                let elem = document.getElementById("php");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any technology</span>`;
                isValid = false;
            }
        }


        if (mysqlvalid.checked) {
            if (!(mysqlbeginervalid.checked || mysqlmidetorvalid.checked || mysqlmastervalid.checked)) {
                let elem = document.getElementById("mysql");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any option</span>`;
                isValid = false;
            }
        }
        if (!mysqlvalid.checked) {
            if ((mysqlbeginervalid.checked || mysqlmidetorvalid.checked || mysqlmastervalid.checked)) {
                let elem = document.getElementById("mysql");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any technology</span>`;
                isValid = false;
            }
        }

        if (laravelvalid.checked) {
            if (!(laravelbeginervalid.checked || laravelmidetorvalid.checked || laravelmastervalid.checked)) {
                let elem = document.getElementById("laravel");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any option</span>`;
                isValid = false;
            }
        }
        if (!laravelvalid.checked) {
            if ((laravelbeginervalid.checked || laravelmidetorvalid.checked || laravelmastervalid.checked)) {
                let elem = document.getElementById("laravel");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any technology</span>`;
                isValid = false;
            }
        }
        if (oraclevalid.checked) {
            if (!(oraclebeginervalid.checked || oraclemidetorvalid.checked || oraclemastervalid.checked)) {
                let elem = document.getElementById("oracle");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any option</span>`;
                isValid = false;
            }
        }
        if (!oraclevalid.checked) {
            if ((oraclebeginervalid.checked || oraclemidetorvalid.checked || oraclemastervalid.checked)) {
                let elem = document.getElementById("oracle");
                elem.parentNode.innerHTML += `<span class="dynamic" >please select any technology</span>`;
                isValid = false;
            }
        }
    }

    if (tabIndex == 6) {
        let require_field = document.getElementsByClassName("required2");
        // console.log(require_field[0].parentNode);
        for (const i of require_field) {
            if (i.value === "") {
                i.parentNode.innerHTML += `<span class="dynamic" > Required</span>`;
                isValid = false;
            }
        }
    }



    if (isValid) {
        document.getElementsByClassName("step")[currentTab].className += " finish";
    }
    // return the valid status

    return isValid;
}
function Remerror() {
    let dynamic_class = document.querySelectorAll(".dynamic");
    for (const i of dynamic_class) {
        i.remove();
    }
}

const validateName = (inputname) => {

    let inputfield = document.getElementById(inputname).value;
    // console.log(inputfield);
    let nameregex = /^[a-zA-Z\s]*$/;
    if (!nameregex.test(inputfield)) {
        let elem = document.getElementById(inputname);
        elem.parentNode.innerHTML += `<span class="dynamic" > enter a valid input</span>`
        // console.log('inside validate false');
        return isValid = false;
    }
    // console.log('inside validate true')
    return isValid = true;


}