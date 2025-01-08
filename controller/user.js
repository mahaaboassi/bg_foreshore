const User =  require("../models/User")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const countriesData = require('../data/countries');


const SignUp = async (req,res) =>{
    const { name, email ,password , country_dial, phone_number, role  } = req.body
    try {
        if (!name || !email || !password || !country_dial || !phone_number) {
          return res.status(400).json({
            error: 1,
            data : [],
            message: "All fields are required.",
            status : 400
          });
        }
        const userExist = await User.findOne({email})
        if(userExist) return res.status(409).json({
          error: 1,
          data : [],
          message: "This email aleardy exist.",
          status : 409
        });
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

        // Password validation (at least 6 characters for example)
        if (password.length < 6) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Password must be at least 6 characters long.",
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
        

    
        const hashedPassword = await bcrypt.hash(password, 10);
        const data = {name, email ,password : hashedPassword  , country_dial, phone_number}
        const country = countriesData.find(e=> e.dial_code == country_dial)
        
        if(country){
            data["country_name"] =  country.name,
            data["country_code"] =  country.code
        }else{
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Invalid country code.",
                status: 400
            });
        }
        
        if(role && ['admin', 'user'].includes(role)) data["role"] = role
        const user = new User(data);
        await user.save();

        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
          expiresIn: "1h",
          });
        res.status(200).json({
            error : 0,
            data : { token, userId: user._id , 
                email : user.email ,
                name : user.name ,
                role : user.role,
                country : {
                    country_code : user.country_code,
                    phone_number : user.phone_number, 
                    country_dial : user.country_dial,
                    country_name : user.country_name
                }
            },
            message : "User registered successfully!"
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
            error : 1,
            data : [],
            message : "Server error." 
        });
      }
}
const SignIn  = async (req,res)=>{
    const {email ,password } = req.body
    try {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({
            error : 1,
            data : [],
            message: "User not found."
        });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
              error : 1,
              data : [],
              message: "Invalid credentials."
          });   
          }
        const token = jwt.sign({ id: user._id ,role : user.role}, process.env.JWT_SECRET, {
        expiresIn: "1h",
        });

        res.status(200).json({
            error : 0,
            data : { token, userId: user._id ,
                email : user.email ,
                name : user.name ,
                role : user.role,
                country : {
                    country_code : user.country_code,
                    phone_number : user.phone_number, 
                    country_dial : user.country_dial,
                    country_name : user.country_name
                }
                
            },
            message : "User signIn successfully!"
        });
      } catch (error) {
        res.status(500).json({
            error : 1,
            data : [],
            message : "Server error." 
        });
      }
}
module.exports = {
    SignUp,
    SignIn
}