const feature = require("../models/feature");
const User = require("../models/User")
const { del } = require('@vercel/blob');


const Add = async (req, res) => {
    const {name_ar, name_en, description_ar , description_en } = req.body

       
    try {
        if (!name_ar || !name_en ) {
          return res.status(400).json({
            error: 1,
            data : [],
            message: "Name fields are required.",
            status : 400
          });
        }
        const user = await User.findById(req.user.id)
        if(!user){
            return res.status(400).json({
                error: 1,
                data : [],
                message: "User not found.",
                status : 400
              });
        }
        const data = {
            name_ar : name_ar,
            name_en : name_en,
            added_by : {
                id : user._id,
                name  : user.name,
                email : user.email,
            },
            description_en : description_en || "",
            description_ar : description_ar || "",  // If description is provided, use it; otherwise, set it to an empty string.
        };
        // if (!req.file) {
        //     return res.status(500).json({
        //                 error: 1,
        //                 data: [],
        //                 message: 'No file provided for upload.', 
        //                 status: 400
        //             });
        //   }
        data.photo = req.fileInfo || "";
        const featureSave = new feature(data);
        await featureSave.save();

        res.status(200).json({
            error : 0,
            data : { id: featureSave._id , 
                name_ar : featureSave.name_ar ,
                name_en : featureSave.name_en ,
                description_ar : featureSave.description_ar ,
                description_en : featureSave.description_en ,
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
    const { name_ar, name_en ,description_ar , description_en } = req.body

    try {
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
                name_ar : name_ar,
                name_en : name_en,
                description_ar : description_ar || "",
                description_en : description_en ||  ""  // Optional field, default to an empty string
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
       
        
        if (req.file) {
               // Delete the old photo from Vercel Blob (if it exists)
               if (featureToUpdate.photo) {
                const oldPhotoUrl = featureToUpdate.photo.url;
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
            featureToUpdate.photo = req.fileInfo;
        }
        await featureToUpdate.save()
        
        // Respond with a success message
        res.status(200).json({
            error: 0,
            data: { id : featureToUpdate._id , 
                name_ar : featureToUpdate.name_ar ,
                name_en : featureToUpdate.name_en ,
               description_ar : featureToUpdate.description_ar ,
               description_en : featureToUpdate.description_en ,
               photo : featureToUpdate.photo
           },
            message: "Feature updated successfully."
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
    const {name_ar, name_en , description_ar , description_en  ,id_feature , icon} = req.body

       
    try {
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
        if (!name_ar  || !name_en   ) {
          return res.status(400).json({
            error: 1,
            data : [],
            message: "Name fields are required.",
            status : 400
          });
        }
        if (!icon  ) {
            return res.status(400).json({
              error: 1,
              data : [],
              message: "Icon field is required.",
              status : 400
            });
          }
        const user = await User.findById(req.user.id)
        if(!user){
            return res.status(400).json({
                error: 1,
                data : [],
                message: "User not found.",
                status : 400
              });
        }
        const subFeatureData = {
            name_en : name_en,
            name_ar : name_ar,
            added_by :  {
                id : user._id,
                name  : user.name,
                email : user.email,
            },
            icon : icon,
            description_ar : description_ar || "",
            description_en : description_en || "",  // If description is provided, use it; otherwise, set it to an empty string.
        };
        // if (!req.file) {
        //     return res.status(500).json({
        //                 error: 1,
        //                 data: [],
        //                 message: 'No file provided for upload.',
        //                 status: 400
        //             });
        //   }
        // Handle the file upload if a file is uploaded
        // subFeatureData.photo = req.fileInfo; 
        rootFeature.subFeatures.push(subFeatureData);  // Add the sub-feature to the feature
        await rootFeature.save();  // Save the updated feature
        res.status(200).json({
            error : 0,
            data: {
                id : rootFeature.subFeatures[rootFeature.subFeatures.length - 1]._id,  // New sub-feature ID
                name_ar : subFeatureData.name_ar,
                name_en : subFeatureData.name_en,
                description_ar : subFeatureData.description_ar,
                description_en : subFeatureData.description_en,
                icon: subFeatureData.icon ,
                root_feature :{
                    id: rootFeature._id,  // ID of the root feature
                    name_ar : rootFeature.name_ar,
                    name_en : rootFeature.name_en,
                }
            },
            message: "Sub-feature added successfully!"
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
const UpdateSubFeature = async (req, res) => {
    const {name_ar ,name_en , description_en, description_ar ,id_feature } = req.body
    const { id } = req.params
       
    try {
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
        if (!name_ar || !name_en ) {
          return res.status(400).json({
            error: 1,
            data : [],
            message: "Name fields are required.",
            status : 400
          });
        }
        // Update the sub-feature fields
        if (name_ar) currentFeature.name_ar = name_ar;
        if (name_en) currentFeature.name_en = name_en;
        if (description_ar) currentFeature.description_ar = description_ar;
        if (description_en) currentFeature.description_en = description_en;
         // If a new photo is uploaded, handle it
         
        // Handle the file upload if a file is uploaded
        if (req.file) {
             // Delete the old photo from Vercel Blob (if it exists)
             if (currentFeature.photo) {
                const oldPhotoUrl = currentFeature.photo.url;
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
            currentFeature.photo = req.fileInfo;

        }
        rootFeature.subFeatures.push(currentFeature);  // Add the sub-feature to the feature
        await rootFeature.save();  // Save the updated feature

        

        res.status(200).json({
            error : 0,
            data: {
                id: currentFeature._id,  // New sub-feature ID
                name_ar: currentFeature.name_ar,
                name_en: currentFeature.name_en,
                description_ar: currentFeature.description_ar,
                description_en: currentFeature.description_en,
                photo: currentFeature.photo ,
                root_feature :{
                    id: rootFeature._id,  // ID of the root feature
                    name_ar: rootFeature.name_ar, 
                    name_en: rootFeature.name_en,
                }
            },
            message: "Sub-feature added successfully!"
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
const GetAllSubFeatures = async (req, res) => {
    try {
        // Extract page and limit from query parameters
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
        const skip = (page - 1) * limit; // Calculate number of items to skip

        // Fetch all features
        const features = await feature.find();

        // If no features found, return empty response
        if (!features || features.length === 0) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "No Features found.",
                status: 404
            });
        }

        // Extract sub-features from features
        let allSubFeatures = features.flatMap(ele => 
            ele.subFeatures.map(subEle => ({
                name_ar: subEle.name_ar,
                name_en: subEle.name_en,
                description_ar: subEle.description_ar,
                description_en: subEle.description_en,
                icon: subEle.icon,
                added_by: subEle.added_by,
                _id: subEle._id,
                date: subEle.date,
                parent: {
                    name_ar: ele.name_ar,
                    name_en: ele.name_en,
                    description_ar: ele.description_ar,
                    description_en: ele.description_en,
                    photo: ele.photo,
                    added_by: ele.added_by,
                    _id: ele._id,
                }
            }))
        );

        // Get total number of sub-features for pagination
        const totalItems = allSubFeatures.length;
        const allPages = Math.ceil(totalItems / limit);

        // Apply pagination on sub-features
        const paginatedSubFeatures = allSubFeatures.slice(skip, skip + limit);

        // Return paginated sub-features with metadata
        res.status(200).json({
            error: 0,
            data: paginatedSubFeatures,
            message: "Sub Features fetched successfully.",
            meta: {
                current_page: page,
                total: totalItems,
                per_page: limit,
                all_pages: allPages,
                last_page: allPages || 1, // Ensure last_page is at least 1
            }
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
    Add,
    Delete,
    Update,
    Get,
    GetAllSubFeatures,
    AddSubFeature,
    UpdateSubFeature,
    DeleteSubFeature
}