





async function print_state(state_id) {
    let s_a = await fetch("http://localhost:8084/state");
    let state_arr = await s_a.json();
    // console.log(s_a);
    // given the id of the <select> tag as function argument, it inserts <option> tags
    var option_str = document.getElementById(state_id);
    option_str.length = 0;
    option_str.options[0] = new Option('Select State', '');
    option_str.selectedIndex = 0;
    for (var i = 0; i < state_arr.length; i++) {
        option_str.options[option_str.length] = new Option(state_arr[i], state_arr[i]);
    }
}

async function print_city(city_id, city_index) {
    let s_a = await fetch("http://localhost:8084/ajaxstatedata");
    let city = await s_a.json()
    console.log(city);
    var option_str = document.getElementById(city_id);
    option_str.length = 0;	// Fixed by Julian Woods
    option_str.options[0] = new Option('Select City', '');
    option_str.selectedIndex = 0;
    var city_arr = city[city_index].split("|");
    for (var i = 0; i < city_arr.length; i++) {
        option_str.options[option_str.length] = new Option(city_arr[i], city_arr[i]);
    }
}