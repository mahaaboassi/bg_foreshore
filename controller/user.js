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
// Users APIs
const AddUser = async (req, res)=>{

    const {name , email , password , country_dial, phone_number ,role ,gender,birthday, active,country } = req.body
    // country_name, country_code
    try{
        if (!name || !email || !password || !country_dial || !phone_number) {
            return res.status(400).json({
              error: 1,
              data : [],
              message: "(Name - Email - Password - Phone Number) fields are required.",
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
          const data = {name, email ,password : hashedPassword,added_by : req.user.id  , country_dial, phone_number}
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
          
          if(role) {
            if(['admin', 'user'].includes(role)){
                data["role"] = role
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
          if(gender != undefined) {
            if(['1', '0'].includes(gender)){
                data["gender"] = gender
            }else{
                return res.status(400).json({
                    error: 1,
                    data: [],
                    message: "Please provide a valid Gender.",
                    status: 400
                });
            }
            
          }else{
            data["gender"] = "0"
          }
          if(active != undefined ) {
            if(['1', '0'].includes(active)){
                data["active"] = active
            }else{
                return res.status(400).json({
                    error: 1,
                    data: [],
                    message: "Please provide a valid Active.",
                    status: 400
                });   
            }
            
          }else{
            data["active"] = "0"
          }
          if(birthday) {
            data["birthday"] = birthday
          }else{
            data["birthday"] = ""
          }

          data.file = req.fileInfo;
          const user = new User(data);
          await user.save();
            res.status(200).json({
                error : 0,
                data : {  
                    id: user._id,
                    email : user.email ,
                    name : user.name ,
                    role : user.role,
                    birthday : user.birthday,
                    active : user.active,
                    gender : user.gender,
                    country_name: user.country,
                    country : {
                        country_code : user.country_code,
                        phone_number : user.phone_number, 
                        country_dial : user.country_dial,
                        country_name : user.country_name
                    },
                    file :user.file || ""
                },
                message : "User Added successfully!"
            });
    }catch (error) {
        console.error(error);
        res.status(500).json({
            error : 1,
            data : [],
            message : "Server error." 
        });

    }
}
const DeleteUser = async (req, res) => {
    const { id } = req.params; // Get the ID from the URL parameter
    try {
        // Check if the id is provided
        if (!id) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "User ID is required.",
                status: 400
            });
        }
        // Find and delete  by id
        const userToDelete = await User.findByIdAndDelete(id);

        if (!userToDelete) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "User not found.",
                status: 404
            });
        }

        // Respond with a success message
        res.status(200).json({
            error: 0,
            data: [],
            message: "User deleted successfully."
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
const UpdateUser = async (req, res) => {
    const { id } = req.params; // Get the ID from the URL parameter
    const { name , password , country_dial, phone_number ,role ,gender,birthday, active,country  } = req.body

    try {

        // Check if the id is provided
        if (!id) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "User ID is required.",
                status: 400
            });
        }

        // Find the user by ID first
        const existingUser = await User.findById(id);

        if (!existingUser) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "User not found.",
                status: 404
            });
        }

        if(name != undefined && name == "" ){
            return res.status(400).json({
                error: 1,
                data : [],
                message: "Name field is required.",
                status : 400
              });
        }
        
        if(password != undefined && password <6 ){
            return res.status(400).json({
                error: 1,
                data : [],
                message: "Password must be at least 6 characters long.",
                status : 400
              });
             
        }
        const phoneRegex = /^\d{10,15}$/;  // Accepts 10-15 digits
        if(phone_number  != undefined && !phoneRegex.test(phone_number)){
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Please provide a valid phone number.",
                status: 400
            });
        }
        const countryCodeRegex = /^\+\d{1,4}$/;  // e.g., +1, +44, +971
        if(country_dial  != undefined && !countryCodeRegex.test(country_dial)){
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Please provide a valid country code.",
                status: 400
            });
        }
        if(role != undefined &&  !['user', 'admin'].includes(role)){
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Please provide a valid Role.",
                status: 400
            });
        }
        if(active != undefined &&  !['1', '0'].includes(active)){
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Please provide a valid Active.",
                status: 400
            });
        }
        if(gender != undefined &&  !['1', '0'].includes(gender)){
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Please provide a valid Gender.",
                status: 400
            });
        }
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        
        // Merge existing data with the new data, only updating provided fields
        const updatedData = {
            name: name ?? existingUser.name,
            password: hashedPassword ?? existingUser.password,
            country_dial: country_dial ?? existingUser.country_dial,
            phone_number: phone_number ?? existingUser.phone_number,
            role: role ?? existingUser.role ,
            gender: gender ?? existingUser.gender ,
            birthday: birthday ?? existingUser.birthday,
            active: active ?? existingUser.active,
            country: country ?? existingUser.country ,
        };
        
        // Find and delete the user by id
        const userToUpdate = await User.findOneAndUpdate(
            { _id: id },  // Find the document by ID
             updatedData,
            { new: true }  // Ensure the updated document is returned
        );
        
        if (!userToUpdate) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "Type not found.",
                status: 404
            });
        }
        // If a new photo is uploaded, handle it
       
        if (req.file) {
                      // Delete the old photo from Vercel Blob (if it exists)
                      if (userToUpdate.file) {
                        const oldPhotoUrl = userToUpdate.file.url;
                        const oldFileName = oldPhotoUrl.split('/').pop(); // Extract file name from the URL
        
                        try {
                            await del(oldFileName, {
                                token: process.env.BLOB_XX_ABCDEFGHIJKLMNOPQRSTUVWXY_READ_WRITE_TOKEN
                            });
                            console.log(`Deleted old photo: ${oldFileName}`);
                        } catch (deleteError) {
                            console.warn('Failed to delete previous photo:', deleteError);
                            // Continue with the update even if deletion fails
                        }
                    }
        
                    // Update the photo field with the new file URL from Vercel Blob
                    userToUpdate.file = req.fileInfo;
                
        }
       
        await userToUpdate.save();
        // Respond with a success message
        res.status(200).json({
            error: 0,
            data:{  
                id: userToUpdate._id,
                email : userToUpdate.email ,
                name : userToUpdate.name ,
                role : userToUpdate.role,
                birthday : userToUpdate.birthday,
                active : userToUpdate.active,
                gender : userToUpdate.gender,
                country: userToUpdate.country,
                country : {
                    country_code : userToUpdate.country_code,
                    phone_number : userToUpdate.phone_number, 
                    country_dial : userToUpdate.country_dial,
                    country_name : userToUpdate.country_name
                },
                file : userToUpdate.file || ""
            },
            message: "User updated successfully."
        });
        
    } catch (error) {
        // Handle other errors
        console.error(error);
        res.status(500).json({
            error: 1,
            data: [],
            message: "Server error.",
            status : 500
        });
    }
}
const GetAllUsers = async (req, res) => {
    try {
         // Extract page and limit from query parameters
         const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
         const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
 
         // Calculate the number of items to skip
         const skip = (page - 1) * limit;
       
         // Fetch types with pagination
         const data = await User.find()
             .skip(skip)
             .limit(limit);
 
         // Get total number of items for metadata
         const totalItems = await User.countDocuments();
 
         // Calculate total pages
         const allPages = Math.ceil(totalItems / limit);
        // Get the last page
        const lastPage = allPages > 0 ? allPages : 1; // Set lastPage to 1 if there are no types

        // Fetch all types from the database
        if (!data || data.length === 0) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "No Users found.",
                status: 404
            });
        }

        // Respond with the fetched types
         // Return the data with metadata
         res.status(200).json({
            error: 0,
            data: data,
            message: "Users fetched successfully.",
            meta: {
                current_page: page,
                total : totalItems,
                per_page :limit,
                all_pages :allPages,
                last_page :lastPage,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 1,
            data: [],
            message: "Server error.",
            status: 500
        });
    }
   
}
const GetOneUser = async (req, res) => {
    const { id } = req.params
    try {

        // Check if the id is provided
        if (!id) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "User ID is required.",
                status: 400
            });
        }

        // Find the user by ID first
        const existingUser = await User.findById(id);

        if (!existingUser) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "User not found.",
                status: 404
            });
        }
         res.status(200).json({
            error: 0,
            data: existingUser,
            message: "User fetched successfully.",
            meta: existingUser,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 1,
            data: [],
            message: "Server error.",
            status: 500
        });
    }
   
}
module.exports = {
    SignUp,
    SignIn,
    AddUser,
    DeleteUser,
    GetOneUser ,
    UpdateUser,
    GetAllUsers
}