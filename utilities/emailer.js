var nodeMailer = require('nodemailer');
var transport = nodeMailer.createTransport();

module.exports = {};

module.exports.sendPasswordReset = function (emailAddress, token, callback) {
    transport.sendMail({
        from: "Robot <robot@no-reply>",
        to: emailAddress,
        subject: "Password Reset",
        text: "http://demo.stuefenengineering.com/account?token=" + token
    }, callback);
};
