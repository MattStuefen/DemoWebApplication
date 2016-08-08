var nodeMailer = require('nodemailer');
var transport = nodeMailer.createTransport();

module.exports = {};

module.exports.sendPasswordReset = function (emailAddress, token, callback) {
    transport.sendMail({
        from: "Robot <robot@no-reply>", // sender address
        to: emailAddress, // list of receivers
        subject: "Password Reset", // Subject line
        text: "http://localhost:3000/changePassword?token=" + token // plaintext body
    }, callback);
};
