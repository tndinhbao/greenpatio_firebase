import * as functions from 'firebase-functions';
const fbAdmin = require('firebase-admin');
const nodemailer = require('nodemailer');

fbAdmin.initializeApp();
const DST_MAIL = functions.config().gmail.to;
const gmailEmail = functions.config().gmail.login;
const gmailPassword = functions.config().gmail.pass;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,

  },
});

interface IMessage {
  name: string; email: string; message: string
}
type SendMailFn = (msgData: IMessage) => Promise<any>;

const sendMail: SendMailFn = async (msgData) => {
  const mailOptions = {
    from: gmailEmail,
    to: DST_MAIL,
    subject: `message - quangdungfurniture.com`,
    html: `
    <p>Sent by: ${msgData.name}</p>
    <p>Email: ${msgData.email}</p>
    <p>${msgData.message}</p>
    `
  };

  await mailTransport.sendMail(mailOptions);
  console.log(`Sent receive message to ${DST_MAIL}`);
  return null;
}

exports.createMessagge = functions
  .region("asia-northeast1")
  .firestore
  .document("contact_messages/{mid}")
  .onCreate(async (snap, context) => {
    // Get an object representing the document
    const newMessage = snap.data();
    return sendMail(newMessage as IMessage);
  });

// exports.sendMail = functions.https.onRequest(async (request, responde) => {
//   // getting dest email by query string
//   const dest = request.query.dest;

//   const mailOptions = {
//     from: 'Your Account Name <yourgmailaccount@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
//     to: dest,
//     subject: 'I\'M A PICKLE!!!', // email subject
//     html: `<p style="font-size: 16px;">Pickle Riiiiiiiiiiiiiiiick!!</p>
//           <br />
//           <img src="https://images.prod.meredith.com/product/fc8754735c8a9b4aebb786278e7265a5/1538025388228/l/rick-and-morty-pickle-rick-sticker" />
//       ` // email content in HTML
//   };

//   // returning result
//   try {
//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     return responde.send(error.toString());
//   }

//   return responde.send('Sended');
// });
