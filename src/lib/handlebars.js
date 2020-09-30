const paginate = require('./handlebars-pagination');

const helpers = {};

helpers.paginate = paginate.createPagination;

helpers.isSelected = (element, value) => {
    return element === value ? 'selected' : '';
};

helpers.isEqual = (a, b, options) => {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
}

module.exports = helpers;