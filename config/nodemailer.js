const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: "support@binarytradesview.com",
    pass: "Bnp1234#",
  },
});

function sendMail(mailOptions) {
  return new Promise(function (resolve, reject) {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      }
      resolve(info);
    });
  });
}

module.exports = sendMail;

// USAGE:
// const mailOptions = {
//     from: "Sender Name <sender@domain.tld>",
//     to: "Recipient",
//     subject: ``,
//     text: ``,
//      html: ``,
// };

// const response = await sendMail(mailOptions);
