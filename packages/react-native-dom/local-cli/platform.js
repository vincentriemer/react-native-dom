let config = {};

Object.assign(config, require("./core/dom"));
Object.assign(config, require("./link"));

module.exports = { dom: config };
