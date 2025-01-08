const type = require("../models/type");
const jwt = require("jsonwebtoken");
const path = require("path")
const fs = require('fs');

const AddType = async (req, res) => {
    const {name , description } = req.body
    // Extract the token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(403).json({
            error: 1,
            data: [],
            message: "Token is required for authentication.",
            status: 403,
        });
       }
       
    try {
         // Verify the token
         const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Your secret key here
         // Check if the user is an admin
         if (decoded.role !== 'admin') {
             return res.status(403).json({
                 error: 1,
                 data: [],
                 message: "You do not have the necessary permissions to add a type.",
                 status: 403,
             });
         }
        if (!name ) {
          return res.status(400).json({
            error: 1,
            data : [],
            message: "Name field is required.",
            status : 400
          });
        }

        const data = {
            name: name,
            description: description || "",  // If description is provided, use it; otherwise, set it to an empty string.
        };
        
        const typeSave = new type(data);
        if (!req.file) {
            return res.status(400).json({
              error: 1,
              data : [],
              message: 'File upload failed!',
              status : 400
            });
          }else{
            typeSave.photo = `${req.file.path}`
          }
        await typeSave.save();

        res.status(200).json({
            error : 0,
            data : { id:typeSave._id , 
                 name : typeSave.name ,
                description : typeSave.description ,
                photo : typeSave.photo
            },
            message : "Add Type successfully!"
        });
      } catch (error) {
        // Handle token expiration error
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 1,
                data: [],
                message: "Token has expired. Please login again.",
                status: 401
            });
        }

        // Handle other errors
        console.error(error);
        res.status(500).json({
            error: 1,
            data: [],
            message: "Server error."
        });
      }
}
const DeleteType = async (req, res) => {
    const { id } = req.params; // Get the ID from the URL parameter

    // Extract the token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(403).json({
            error: 1,
            data: [],
            message: "Token is required for authentication.",
            status: 403,
        });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is an admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                error: 1,
                data: [],
                message: "You do not have the necessary permissions to delete a type.",
                status: 403,
            });
        }

        // Check if the id is provided
        if (!id) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Type ID is required.",
                status: 400
            });
        }

        // Find and delete the type by id
        const typeToDelete = await type.findByIdAndDelete(id);

        if (!typeToDelete) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "Type not found.",
                status: 404
            });
        }

        // Respond with a success message
        res.status(200).json({
            error: 0,
            data: [],
            message: "Type deleted successfully."
        });

    } catch (error) {
         // Handle token expiration error
         if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 1,
                data: [],
                message: "Token has expired. Please login again.",
                status: 401
            });
        }

        // Handle other errors
        console.error(error);
        res.status(500).json({
            error: 1,
            data: [],
            message: "Server error."
        });
    }

}
const UpdateType = async (req, res) => {
    const { id } = req.params; // Get the ID from the URL parameter
    const { name , description } = req.body
    // Extract the token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(403).json({
            error: 1,
            data: [],
            message: "Token is required for authentication.",
            status: 403,
        });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is an admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                error: 1,
                data: [],
                message: "You do not have the necessary permissions to delete a type.",
                status: 403,
            });
        }

        // Check if the id is provided
        if (!id) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Type ID is required.",
                status: 400
            });
        }

        // Find and delete the type by id
        const typeToUpdate = await type.findOneAndUpdate(
            { _id: id },  // Find the document by ID
            {
                name: name,
                description: description ? description : ""  // Optional field, default to an empty string
            },
            { new: true }  // Ensure the updated document is returned
        );
        
        if (!typeToUpdate) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "Type not found.",
                status: 404
            });
        }
        // If a new photo is uploaded, handle it
        if (req.file) {
            // Delete the old file if it exists
            if (typeToUpdate.photo) {

                fs.unlinkSync(path.resolve(typeToUpdate.photo)); // This will delete the old file
            }
            
            // Save the new file path
            typeToUpdate.photo = `${req.file.path}`;
        }
       
        await typeToUpdate.save();
        // Respond with a success message
        res.status(200).json({
            error: 0,
            data: { id :typeToUpdate._id , 
                name : typeToUpdate.name ,
               description : typeToUpdate.description ,
               photo : typeToUpdate.photo
           },
            message: "Type updated successfully."
        });
        
    } catch (error) {
         // Handle token expiration error
         if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 1,
                data: [],
                message: "Token has expired. Please login again.",
                status: 401
            });
        }

        // Handle other errors
        console.error(error);
        res.status(500).json({
            error: 1,
            data: [],
            message: "Server error."
        });
    }
}
const GetType = async (req, res) => {
    try {
         // Extract page and limit from query parameters
         const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
         const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
 
         // Calculate the number of items to skip
         const skip = (page - 1) * limit;
       
         // Fetch types with pagination
         const types = await type.find()
             .skip(skip)
             .limit(limit);
 
         // Get total number of items for metadata
         const totalItems = await type.countDocuments();
 
         // Calculate total pages
         const allPages = Math.ceil(totalItems / limit);
        // Get the last page
        const lastPage = allPages > 0 ? allPages : 1; // Set lastPage to 1 if there are no types

        // Fetch all types from the database
        if (!types || types.length === 0) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "No types found.",
                status: 404
            });
        }

        // Respond with the fetched types
         // Return the data with metadata
         res.status(200).json({
            error: 0,
            data: types,
            message: "Types fetched successfully.",
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
            message: "Server error."
        });
    }
   
}

module.exports = {
    AddType,
    DeleteType,
    UpdateType,
    GetType ,
}