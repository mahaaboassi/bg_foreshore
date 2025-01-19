const type = require("../models/Type");
const User = require("../models/User")
const { del } = require('@vercel/blob');


const AddType = async (req, res) => {
    const {name_ar, name_en, description_ar , description_en , } = req.body
    try {
        if (!name_ar || !name_en) {
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
            added_by: {
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
        const typeSave = new type(data);
        await typeSave.save();

        res.status(200).json({
            error : 0,
            data : { id:typeSave._id , 
                name_ar : typeSave.name_ar ,
                name_en : typeSave.name_en ,
                description_en : typeSave.description_en ,
                description_ar : typeSave.description_ar ,
                photo : typeSave.photo
            },
            message : "Add Type successfully!"
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
const DeleteType = async (req, res) => {
    const { id } = req.params; // Get the ID from the URL parameter
    try {
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
    const { name_ar, name_en ,description_ar , description_en } = req.body

    try {

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
                name_ar : name_ar,
                name_en : name_en,
                description_en : description_en || "",
                description_ar : description_ar || ""  // Optional field, default to an empty string
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
                      // Delete the old photo from Vercel Blob (if it exists)
                      if (typeToUpdate.photo) {
                        const oldPhotoUrl = typeToUpdate.photo.url;
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
                    typeToUpdate.photo = req.fileInfo;
                
        }
       
        await typeToUpdate.save();
        // Respond with a success message
        res.status(200).json({
            error: 0,
            data: { id :typeToUpdate._id , 
               name_ar : typeToUpdate.name_ar ,
               name_en : typeToUpdate.name_en ,
               description_ar : typeToUpdate.description_ar ,
               description_en : typeToUpdate.description_en ,
               photo : typeToUpdate.photo
           },
            message: "Type updated successfully."
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
            message: "Server error.",
            status: 500
        });
    }
   
}

module.exports = {
    AddType,
    DeleteType,
    UpdateType,
    GetType ,
}