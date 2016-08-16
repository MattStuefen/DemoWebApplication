// Parse through all user provided input args and split into key value pairs
// Note: If only the key is provided the value will be 'undefined'
module.exports = process.argv.slice(2).reduce(function (out, curString) {
    var keyVal = curString.split('=');
    out[keyVal[0]] = keyVal[1];
    return out;
}, {});
