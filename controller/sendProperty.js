const nodemailer = require("nodemailer");
const countriesData = require('../data/countries');
const ListProperty = require("../models/ListProperty");

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
        subject: "Confirmation: Property Listing Received",
        // text: `Dear ,\n\nThank you for listing your property with us. We are reviewing your details and will get back to you shortly.\n\nBest regards,\nYour Team`,
        html : `<div style="margin:auto;width: 500px; border-radius:12px;background-color: white;border: 1px solid black;">
        <div style="background: black;border-top-left-radius:12px;border-top-right-radius:12px;padding:10px ; ">
            <div style="margin: auto;text-align: center;">
                <img style="height: 100px;" src="https://mahaaboassi.github.io/images/foreshore.png" alt="foreshore-logo" />

            </div>
            
        </div>
        <div style="padding:10px ;">
            <h1 style="text-align: center;color: #27cbbe;line-height: 3px;">Welcome To Foreshore</h1>
            <h4 style="text-align: center ;line-height: 3px;">Holidays Home Rental</h4>
            <p>Dear ${data.name}</p>
            <p >Thank you for listing your property with us. We are reviewing your details and will get back to you shortly.</p>
            <div>
                <p style="line-height: 1px;">Best regards,</p>
                <p style="line-height: 2px;"> Foreshore Team</p>
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
        to: "globalariz30@gmail.com", // Replace with admin's email
        subject: "New Property Listing",
        html: `<div style="margin:auto;width: 500px ; border-radius:12px;background-color: white;border: 1px solid black;">
        <div style="background: black;border-top-left-radius:12px;border-top-right-radius:12px;padding:10px ; ">
            <div style="margin: auto;text-align: center;">
                <img style="height: 100px;" src="https://mahaaboassi.github.io/images/foreshore.png" alt="foreshore-logo" />

            </div>
            
        </div>
        <div style="padding:10px ;">
            <h1 style="text-align: center;color: #27cbbe;line-height: 3px;">Foreshore</h1>
            <h4 style="text-align: center ;line-height: 3px;">Holidays Home Rental</h4>
            <p>Dear Admin</p>
            <p >A new property listing has been added</p>
            <div>
                <h4>Basic Information</h4>
                <ul>
                    <li > Name : <span>${data.name}</span></li>
                    <li > Email : <span>${data.email}</span></li>
                    <li > Phone : <span>${data.phone_number}</span></li>
                    <li > Country Code : <span>${data.country_dial}</span></li>
                    <li > Role User : <span>${data.role}</span></li>
                </ul>
                <h4>Property Details</h4>
                <ul>
                    <li > Title : <span>${data.title}</span></li>
                    <li > description : <span>${data.description}</span></li>
                    <li > Type : <span>${data.type}</span></li>
                    <li > Number Of Bathroms : <span>${data.bathrooms}</span></li>
                    <li > Number Of Bedrooms : <span>${data.bedrooms}</span></li>
                    <li > Number Of Beds : <span>${data.beds}</span></li>
                    <li > Number Of Guests : <span>${data.guests}</span></li>
                    <li > Furnishing : <span>${data.furnishing==0?"No":"Yes"}</span></li>
                    <li > Ready : <span>${data.ready==0?"No":"Yes"}</span></li>
                </ul>
                <h4>Location</h4>
                <ul>
                    <li > City : <span>${data.city}</span></li>
                    <li > Region : <span>${data.region}</span></li>
                    <li > Street : <span>${data.street}</span></li>
                    <li > Building : <span>${data.building}</span></li>
                    <li > Floor : <span>${data.floor}</span></li>
                </ul>
                <h4>Documents</h4>
                <ul>
                    ${
                        data.files && data.files.length > 0
                            ? data.files.map(
                                (file, index) => `
                                <li >File_${index + 1}: 
                                    <a href="${file.url}" target="_blank">View File</a>
                                </li>
                                `
                            ).join("")
                            : "<p>No Document Provided</p>"
                        }
                    
                </ul>

            </div>
            <div>
                <p style="line-height: 1px;">Best regards,</p>
                <p style="line-height: 2px;"> Foreshore Team</p>
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
  
      // Send Emails
      await transporter.sendMail(userEmailOptions);
      await transporter.sendMail(adminEmailOptions);
      console.log("Emails sent successfully.");
    } catch (error) {
      console.error("Error sending emails:", error);
    }
  };
  
const SendList = async (req,res)=>{
    const {title, description , type , files , furnishing , ready  , name , email  , country_dial, phone_number,role,
         bathrooms ,bedrooms , beds , guests , city , region, street, building , floor  } = req.body

     try {

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
                title :  title || "" ,
                description: description || "",
                bathrooms: bathrooms ? parseInt(bathrooms) : 0,
                bedrooms: bedrooms ? parseInt(bedrooms) : 0,
                beds: beds ? parseInt(beds) : 0,
                guests: guests ? parseInt(guests) : 0,
                city : city || "",
                type : type || "",
                region : region || "",
                street : street || "",
                building : building || "",
                floor : floor || "",
                furnishing : furnishing || "0",
                ready : ready || "0",
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
            if (!req.files) {
                return res.status(500).json({
                            error: 1,
                            data: [],
                            message: 'No file provided for upload.', 
                            status: 400
                        });
              }
              
            data.files = req.fileInfos;
            const propertySave = new ListProperty(data);
            await propertySave.save();
            // Send Emails
            await sendEmail(data);
            res.status(200).json({
                error : 0,
                data : propertySave,
                message : "Property added successfully, and emails sent!"
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

const DeleteList = async (req, res) => {
    const { id } = req.params; // Get the ID from the URL parameter
    try {
        // Check if the id is provided
        if (!id) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Property ID is required.",
                status: 400
            });
        }
        // Find and delete  by id
        const propertyToDelete = await ListProperty.findByIdAndDelete(id);

        if (!propertyToDelete) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "Property not found.",
                status: 404
            });
        }

        // Respond with a success message
        res.status(200).json({
            error: 0,
            data: [],
            message: "Property deleted successfully."
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

const GetAllList = async (req, res) => {
    try {
         // Extract page and limit from query parameters
         const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
         const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
 
         // Calculate the number of items to skip
         const skip = (page - 1) * limit;
       
         // Fetch types with pagination
         const data = await ListProperty.find()
             .skip(skip)
             .limit(limit);
 
         // Get total number of items for metadata
         const totalItems = await ListProperty.countDocuments();
 
         // Calculate total pages
         const allPages = Math.ceil(totalItems / limit);
        // Get the last page
        const lastPage = allPages > 0 ? allPages : 1; // Set lastPage to 1 if there are no types

        // Fetch all types from the database
        if (!data || data.length === 0) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "No Property found.",
                status: 404
            });
        }

        // Respond with the fetched types
         // Return the data with metadata
         res.status(200).json({
            error: 0,
            data: data,
            message: "Properties fetched successfully.",
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
const GetOneList = async (req, res) => {
    const { id } = req.params
    try {
        // Check if the id is provided
        if (!id) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Property ID is required.",
                status: 400
            });
        }

        // Find the user by ID first
        const existingProperty = await ListProperty.findById(id);

        if (!existingProperty) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "Property not found.",
                status: 404
            });
        }
         res.status(200).json({
            error: 0,
            data: existingProperty,
            message: "Property fetched successfully.",
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
    SendList,
    DeleteList,
    GetAllList,
    GetOneList
}