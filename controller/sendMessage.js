const nodemailer = require("nodemailer");
const countriesData = require('../data/countries');
const { AdminEmail } = require("../data/host");
const User = require("../models/User");
const Message = require("../models/Message");


const sendEmail = async (data) => {
    try {
      // Set up the email transporter
      const transporter = nodemailer.createTransport({
        service: "gmail", // Or your preferred email service
        auth: {
          user: "eng.mahaab96@gmail.com", // Replace with your email
          pass: "ucfl tvrd cgwc ltau", // Replace with your email password or app password
        },
      });
  
      // User Email
      const userEmailOptions = {
        from: "eng.mahaab96@gmail.com", // Replace with your email
        to: data.email,
        subject: "Confirmation: Message Received",
        // text: `Dear ,\n\nThank you for listing your property with us. We are reviewing your details and will get back to you shortly.\n\nBest regards,\nYour Team`,
        html : `<div style="margin:auto;width: 500px;color:black; border-radius:12px;background-color: white;border: 1px solid black;">
        <div style="background: black;border-top-left-radius:12px;border-top-right-radius:12px;padding:10px ; ">
            <div style="margin: auto;text-align: center;">
                <img style="height: 100px;" src="https://mahaaboassi.github.io/images/foreshore.png" alt="foreshore-logo" />

            </div>
            
        </div>
        <div style="padding:10px ;">
            <h1 style="text-align: center;color: #27cbbe;line-height: 3px;">Welcome To Foreshore</h1>
            <h4 style="text-align: center;color:black; ;line-height: 3px;">Holidays Home Rental</h4>
            <p style="color:black">Dear ${data.name}</p>
            <p style="color:black">Thank you for reaching out to us! We appreciate your inquiry and will provide you with the requested information as soon as possible.</p>
            <div style="color:black">
                <p style="line-height: 1px;color:black">Best regards,</p>
                <p style="line-height: 2px;color:black"> Foreshore Team</p>
            </div>
        </div>
        <div class="text-align:center">
            <div style="margin: auto;width: 120px;padding-bottom: 10px;">
                <a href="https://foreshore.vercel.app/" >
                    <button style="background-color: #27cbbe;cursor: pointer;color: white;border: none  !important;padding: 10px;border-radius: 12px;">Go To Foreshore</button>
                </a>
            </div>
        </div>
        

    </div>`
    };
  
      // Admin Email
      const adminEmailOptions = {
        from: "eng.mahaab96@gmail.com", // Replace with your email
        to: AdminEmail, // Replace with admin's email
        subject: "New Message From forshore Website",
        html:  `<div style="margin:auto;width: 500px;color:black; border-radius:12px;background-color: white;border: 1px solid black;">
        <div style="background: black;border-top-left-radius:12px;border-top-right-radius:12px;padding:10px;">
            <div style="margin: auto;text-align: center;">
                <img style="height: 100px;" src="https://mahaaboassi.github.io/images/foreshore.png" alt="foreshore-logo" />
            </div>
        </div>
        <div style="padding:10px;color:black;">
            <h1 style="text-align: center;color: #27cbbe;line-height: 3px;">Foreshore</h1>
            <h4 style="text-align: center;color:black;line-height: 3px;">Holidays Home Rental</h4>
            <p style="color:black;">Dear Admin</p>
            <p style="color:black;">A new Message has been received</p>
            <div>
                <h4 style="color:black;">From User</h4>
                <ul style="color:black;">
                    <li style="color:black;">Name: <span>${data.name}</span></li>
                    <li style="color:black;">Email: <span>${data.email}</span></li>
                    <li style="color:black;">Phone: <span>${data.phone_number}</span></li>
                    <li style="color:black;">Country Code: <span>${data.country_dial}</span></li>
                    <li style="color:black;">Role User: <span>${data.role}</span></li>
                </ul>
                <h4 style="color:black;">The Message is </h4>
                <p style="color:black;padding :10px ">${data.message}</p>
            </div>
            <div>
                <p style="color:black;line-height: 1px;">Best regards,</p>
                <p style="color:black;line-height: 2px;">Foreshore Team</p>
            </div>
        </div>
        <div style="text-align:center;">
            <div style="margin: auto;width: 120px;padding-bottom: 10px;">
                <a href="https://foreshore.vercel.app/" style="text-decoration:none;">
                    <button style="background-color: #27cbbe;cursor: pointer;color: white;border: none;padding: 10px;border-radius: 12px;">Go To Foreshore</button>
                </a>
            </div>
        </div>
      </div>`
      };
  
      // Send Emails
      await transporter.sendMail(userEmailOptions);
      await transporter.sendMail(adminEmailOptions);
      console.log("Emails sent successfully.");
    } catch (error) {
      console.error("Error sending emails:", error);
    }
  };
const SendMessageToAdmin = async (req,res)=>{
    console.log(req.body);
    
    const {message, name , email , country_dial, phone_number } = req.body

    try {
        console.log(name,email);
        
       if (!name) {
           return res.status(400).json({
             error: 1,
             data : [],
             message: "Name field is required.",
             status : 400
           });
         }
        // Email validation (simple regex for format)
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(email)) {
             return res.status(400).json({
                 error: 1,
                 data: [],
                 message: "Please provide a valid email address.",
                 status: 400
             });
         }
         // Phone number validation (using simple regex for 10 digits)
         const phoneRegex = /^\d{10,15}$/;  // Accepts 10-15 digits
         if (!phoneRegex.test(phone_number)) {
             return res.status(400).json({
                 error: 1,
                 data: [],
                 message: "Please provide a valid phone number.",
                 status: 400
             });
         }
   
         // Country code validation (starts with '+' and followed by digits)
         const countryCodeRegex = /^\+\d{1,4}$/;  // e.g., +1, +44, +971
         if (!countryCodeRegex.test(country_dial)) {
             return res.status(400).json({
                 error: 1,
                 data: [],
                 message: "Please provide a valid country code.",
                 status: 400
             });
           }
       
   

             const data = {
               message :  message || "" ,
               name ,
               email,
               country_dial, 
               phone_number
               
             };
             const countryCurrent = countriesData.find(e=> e.dial_code == country_dial)
         
             if(countryCurrent){
                 data["country_name"] =  countryCurrent.name,
                 data["country_code"] =  countryCurrent.code
             }else{
                 return res.status(400).json({
                     error: 1,
                     data: [],
                     message: "Invalid country code.",
                     status: 400
                 });
             }
             const roleExist = await User.findOne({ email })
             if(roleExist) {
               if(['admin', 'user'].includes(roleExist.role)){
                   data["role"] = roleExist.role
               }else{
                   return res.status(400).json({
                       error: 1,
                       data: [],
                       message: "Please provide a valid Role.",
                       status: 400
                   });
               }
               
             }else{
               data["role"] = "user"
             }

           const messageSave = new Message(data);
           await messageSave.save();
           // Send Emails
           await sendEmail(data);
           res.status(200).json({
               error : 0,
               data : messageSave,
               message : "Your message sent successfully.Thanks for contact us."
           });
   } catch (error) {
   // Handle other errors
   console.error(error);
   res.status(500).json({
       error: 1,
       data: [],
       message: "Server error."
   });
   }
}
module.exports = {
    SendMessageToAdmin
}