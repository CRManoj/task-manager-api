const sgMail = require('@sendgrid/mail')
//API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//Sending the welcome image
const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'manojkumarc0520@gmail.com',
        subject: 'Thanks for joining in!',
        text: `HI,${name},Welcome to this app.Let me know how you along with the app.`
    })
}

//sending the mail for the cancellation
const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'manojkumarc0520@gmail.com',
        subject: 'Sorry to see you go!',
        text: `GoodBye, ${name}. I hope to see you back sometime soon`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}