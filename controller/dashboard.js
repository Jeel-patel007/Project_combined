
exports.dashboard = (req, res) => {
    res.render("home");
};
exports.kukucube = (req, res) => {
    res.render("exerciese-2")
}
exports.dynamictable = (req, res) => {
    res.render("exerciese-1");
};

exports.tictaktoe = (req, res) => {
    res.render("tictak");
}
exports.eventtable = (req, res) => {
    res.render("eventtable")
}
exports.mergesort = (req, res) => {
    res.render("mergesort");
};