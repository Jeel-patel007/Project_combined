





async function print_state(state_id) {
    let s_a = await fetch("http://localhost:8084/state");
    let state_arr = await s_a.json();

    let option_str = document.getElementById(state_id);
    option_str.length = 0;
    option_str.options[0] = new Option('Select State', '');
    option_str.selectedIndex = 0;
    for (let i = 0; i < state_arr.length; i++) {
        option_str.options[option_str.length] = new Option(state_arr[i], state_arr[i]);
    }
}

async function print_city(city_id, city_index) {
    let s_a = await fetch("http://localhost:8084/ajaxstatedata");
    let city = await s_a.json()
    console.log(city);
    let option_str = document.getElementById(city_id);
    option_str.length = 0;
    option_str.options[0] = new Option('Select City', '');
    option_str.selectedIndex = 0;
    let city_arr = city[city_index].split("|");
    for (let i = 0; i < city_arr.length; i++) {
        option_str.options[option_str.length] = new Option(city_arr[i], city_arr[i]);
    }
}