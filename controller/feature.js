const feature = require("../models/feature");
const jwt = require("jsonwebtoken");
const path = require("path")
const fs = require('fs');

const Add = async (req, res) => {
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
        
        const featureSave = new feature(data);
          // Handle the file upload if a file is uploaded
        if (!req.file) {
            // If no file is uploaded, send an error response (file is required)
            return res.status(400).json({
                error: 1,
                data: [],
                message: 'File upload is required.',
                status: 400
            });
        } else {
            // Save the photo path to the sub-feature
            featureSave.photo = req.file.path;  // Assuming you want to attach the photo to the sub-feature
        }
        await featureSave.save();

        res.status(200).json({
            error : 0,
            data : { id: featureSave._id , 
                 name : featureSave.name ,
                description : featureSave.description ,
                photo : featureSave.photo
            },
            message : "Add Feature successfully!"
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
const Delete = async (req, res) => {
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
                message: "Feature ID is required.",
                status: 400
            });
        }

        // Find and delete the type by id
        const featureToDelete = await feature.findByIdAndDelete(id);

        if (!featureToDelete) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "Feature not found.",
                status: 404
            });
        }

        // Respond with a success message
        res.status(200).json({
            error: 0,
            data: [],
            message: "Feature deleted successfully."
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
const Update = async (req, res) => {
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
                message: "You do not have the necessary permissions to delete a feature.",
                status: 403,
            });
        }

        // Check if the id is provided
        if (!id) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Feature ID is required.",
                status: 400
            });
        }

        // Find and delete the feature by id
        const featureToUpdate = await feature.findOneAndUpdate(
            { _id: id },  // Find the document by ID
            {
                name: name,
                description: description ? description : ""  // Optional field, default to an empty string
            },
            { new: true }  // Ensure the updated document is returned
        );
        
        if (!featureToUpdate) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "Feature not found.",
                status: 404
            });
        }
        // If a new photo is uploaded, handle it
        if (req.file) {
            // Delete the old file if it exists
            if (featureToUpdate.photo) {
          
                fs.unlinkSync(path.resolve(featureToUpdate.photo)); // This will delete the old file
            }   
            featureToUpdate.photo = `${req.file.path}`;
        }
        await featureToUpdate.save()
        
        // Respond with a success message
        res.status(200).json({
            error: 0,
            data: { id : featureToUpdate._id , 
                name : featureToUpdate.name ,
               description : featureToUpdate.description ,
               photo : featureToUpdate.photo
           },
            message: "Feature updated successfully."
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
const Get = async (req, res) => {
    try {
         // Extract page and limit from query parameters
         const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
         const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
 
         // Calculate the number of items to skip
         const skip = (page - 1) * limit;
       
         // Fetch features with pagination
         const features = await feature.find()
             .skip(skip)
             .limit(limit);
 
         // Get total number of items for metadata
         const totalItems = await feature.countDocuments();
 
         // Calculate total pages
         const allPages = Math.ceil(totalItems / limit);
        // Get the last page
        const lastPage = allPages > 0 ? allPages : 1; // Set lastPage to 1 if there are no features

        // Fetch all features from the database
        if (!features || features.length === 0) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "No Features found.",
                status: 404
            });
        }

        // Respond with the fetched features
         // Return the data with metadata
         res.status(200).json({
            error: 0,
            data: features,
            message: "Features fetched successfully.",
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
// Sub Feature
const AddSubFeature = async (req, res) => {
    const {name , description ,id_feature } = req.body
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
                 message: "You do not have the necessary permissions to add a feature.",
                 status: 403,
             });
         }
         // Check if the id is provided
         if (!id_feature) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Feature ID is required.",
                status: 400
            });
        }
         const rootFeature = await feature.findById(id_feature)
         if(!rootFeature){
            return res.status(400).json({
                error: 1,
                data : [],
                message: "Root Feature not found.",
                status : 404
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
        const subFeatureData = {
            name: name,
            description: description || "",  // If description is provided, use it; otherwise, set it to an empty string.
        };
        // Handle the file upload if a file is uploaded
        if (!req.file) {
            // If no file is uploaded, send an error response (file is required)
            return res.status(400).json({
                error: 1,
                data: [],
                message: 'File upload is required.',
                status: 400
            });
        } else {
            // Save the photo path to the sub-feature
            subFeatureData.photo = req.file.path;  // Assuming you want to attach the photo to the sub-feature
        }
        rootFeature.subFeatures.push(subFeatureData);  // Add the sub-feature to the feature
        await rootFeature.save();  // Save the updated feature

        

        res.status(200).json({
            error : 0,
            data: {
                id: rootFeature.subFeatures[rootFeature.subFeatures.length - 1]._id,  // New sub-feature ID
                name: subFeatureData.name,
                description: subFeatureData.description,
                photo: subFeatureData.photo ,
                root_feature :{
                    id: rootFeature._id,  // ID of the root feature
                    name: rootFeature.name, 
                }
            },
            message: "Sub-feature added successfully!"
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
const UpdateSubFeature = async (req, res) => {
    const {name , description ,id_feature } = req.body
    const { id } = req.params
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
                 message: "You do not have the necessary permissions to add a feature.",
                 status: 403,
             });
         }
         if (!id ) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Sub Feature ID not found.",
                status: 400
            });
        }
         // Check if the id is provided
         if (!id_feature ) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Feature ID is required.",
                status: 400
            });
        }
         const rootFeature = await feature.findById(id_feature)
         if(!rootFeature){
            return res.status(400).json({
                error: 1,
                data : [],
                message: "Root Feature not found.",
                status : 404
              });
         }
         const currentFeature = rootFeature.subFeatures.id(id)
         if(!currentFeature){
            return res.status(400).json({
                error: 1,
                data : [],
                message: "Sub Feature not found.",
                status : 404
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
        // Update the sub-feature fields
        if (name) currentFeature.name = name;
        if (description) currentFeature.description = description;

        // Handle the file upload if a file is uploaded
        if (req.file) {
            // Delete the old file if it exists
            if (currentFeature.photo) {
          
                fs.unlinkSync(path.resolve(currentFeature.photo)); // This will delete the old file
            }   
            currentFeature["photo"] = `${req.file.path}`;

        }
        rootFeature.subFeatures.push(subFeatureData);  // Add the sub-feature to the feature
        await rootFeature.save();  // Save the updated feature

        

        res.status(200).json({
            error : 0,
            data: {
                id: currentFeature._id,  // New sub-feature ID
                name: currentFeature.name,
                description: currentFeature.description,
                photo: currentFeature.photo ,
                root_feature :{
                    id: rootFeature._id,  // ID of the root feature
                    name: rootFeature.name, 
                }
            },
            message: "Sub-feature added successfully!"
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
const DeleteSubFeature = async (req, res) => {
    const {id_feature } = req.body
    const { id } = req.params
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
                 message: "You do not have the necessary permissions to add a feature.",
                 status: 403,
             });
         }
         if (!id ) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Sub Feature ID not found.",
                status: 400
            });
        }
         // Check if the id is provided
         if (!id_feature ) {
            return res.status(400).json({
                error: 1,
                data: [],
                message: "Feature ID is required.",
                status: 400
            });
        }
         const rootFeature = await feature.findById(id_feature)
         if(!rootFeature){
            return res.status(400).json({
                error: 1,
                data : [],
                message: "Root Feature not found.",
                status : 404
              });
         }
         const currentFeature = rootFeature.subFeatures.id(id)
         if(!currentFeature){
            return res.status(400).json({
                error: 1,
                data : [],
                message: "Sub Feature not found.",
                status : 404
              });
         }

        // Handle the file upload if a file is uploaded
        if (currentFeature.photo) {
        
            fs.unlinkSync(path.resolve(currentFeature.photo)); // This will delete the old file
        }   


        rootFeature.subFeatures.pull(currentFeature);  // Add the sub-feature to the feature
        await rootFeature.save();  // Save the updated feature

        

        res.status(200).json({
            error: 0,
            data: [],
            message: "Sub-feature deleted successfully!"
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
module.exports = {
    Add,
    Delete,
    Update,
    Get,
    AddSubFeature,
    UpdateSubFeature,
    DeleteSubFeature
}