const { admin, db } = require("../util/admin");
const {sendEmail} = require("../util/email")
const config = require("../util/config");
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
const {
  
  validateLoginData,
  reduceUserDetail,
} = require("../util/validator");
const firebase = require("firebase");
const Busboy = require("busboy");
firebase.initializeApp(config);
const sgMail =require('@sendgrid/mail');


sgMail.setApiKey('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');

exports.pizza=async (req,res)=>{
  const newUser = {
    email: req.body.email,
    
  };
  const sender=(mms)=>{

      const msg={
          
        to: mms
      ,
from:'pizzespage@gmail.com',
templateId:'24dfdb3b-1fa2-4238-bbff-81dca68b8ba0',
dynamic_template_data:{
  subject:'welcome to pizzes',
}

}
sgMail.send(msg)

  }
res.set('Access-Control-Allow-Origin', '*');
try {
  await sender(req.body.email)
  await db.collection("emails").add(newUser);
 return res.send("success")
 
} catch (error) {
  console.log(error)
  return res.send(error)
  
}

}
exports.cont = async (req,res)=>{
  const info={
    email:req.body.email,
    name:req.body.name,
    message:req.body.message,
  }
  const sender=()=>{

    const msg={
        
      to: "pizzespage@gmail.com"
    ,
from:'lpizzes@gmail.com',
templateId:'d-a60a36acac83436ab8dc5e97f53f0652',
dynamic_template_data:{
message:info.message,
name:info.name,
email:info.email,

}

}
sgMail.send(msg)

}
res.set('Access-Control-Allow-Origin', '*');

try {
  await sender()
  return res.send("success")
} catch (error) {
  return res.send("error")
}
}
// let transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//       user: 'mgikundacodes@gmail.com',
//       pass: '36927683pm'
//   }
// });
exports.subs=(req,res)=>{
  cors(req, res, () => {
      
    // getting dest email by query string
    const dest = req.body.dest;

    const mailOptions = {
        from: 'petermbiriri8957@gmail.com', // Something like: Jane Doe <janedoe@gmail.com>
        to: dest,
        subject: 'I\'M A PICKLE!!!', // email subject
        html: `<p style="font-size: 16px;">Pickle Riiiiiiiiiiiiiiiick!!</p>
            <br />
            <img src="https://images.prod.meredith.com/product/fc8754735c8a9b4aebb786278e7265a5/1538025388228/l/rick-and-morty-pickle-rick-sticker" />
        ` // email content in HTML
    };

    // returning result
    return transporter.sendMail(mailOptions, (erro, info) => {
        if(erro){
            return res.send(erro.toString());
        }
        return res.send('Sended');
    });
});    
}
exports.subscribe = async (req, res) => {
  const newUser = {
    email: req.body.email,
    
  };
 
    
try {
  const nu= await db.collection("emails").add(newUser);
  const result= await cors(req,res,sendEmail(newUser.email));
  return res.send({result:"this is great"});
} catch (error) {
  return res.json(err)
}

//  db.collection("emails").add(newUser).then((doc)=>{


//   return newUser;
// }).then((data)=>{


// }).catch((err)=>{
//   return res.json(err)
// })
 
};
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };
  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(403)
        .json({ general: "wrong credentials ,please try again" });
    });
};
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.name}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db.collection("likes").where("name", "==", req.user.name).get();
      }
    })
    .then((data) => {
      userData.likes = [];
      data.forEach((doc) => {
        userData.likes.push(doc.data());
      });

      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
