const feature = require("../models/feature");
const property  = require("../models/Property")
const User = require("../models/User")

const AddProperty = async (req,res)=>{
    const {name_ar, name_en , description_ar , description_en, features , type , files , furnishing , ready , owner ,
         bathrooms,link_map ,bedrooms,registration_number , beds , guests , city , region, street, building , floor  } = req.body

     try {
            if (!name_ar || !name_en) {
              return res.status(400).json({
                error: 1,
                data : [],
                message: "Name fields are required.",
                status : 400
              });
            }
            if (!registration_number) {
                return res.status(400).json({
                  error: 1,
                  data : [],
                  message: "Registration Number field is required.",
                  status : 400
                });
              }
            if (!type ) {
                return res.status(400).json({
                  error: 1,
                  data : [],
                  message: "Type field is required.",
                  status : 400
                });
              }
              if (!furnishing || !ready ) {
                return res.status(400).json({
                  error: 1,
                  data : [],
                  message: "( Furnishing and Ready ) fields are required.",
                  status : 400
                });
              }

              const isValidNumber = (value) => {
                return value != null && !isNaN(value) && /^[0-9]+$/.test(value.toString());
              };
              if ( !isValidNumber(bathrooms) || !isValidNumber(bedrooms) || !isValidNumber(beds) || !isValidNumber(guests) ) {
                return res.status(400).json({
                  error: 1,
                  data: [],
                  message: "(Bathrooms, Bedrooms, Beds, and Guests) fields must be valid numbers.",
                  status: 400,
                });
              }
              if (!city || !region || !street || !building || !floor || !link_map) {
                return res.status(400).json({
                  error: 1,
                  data : [],
                  message: "( City, Region, Street, Building, Floor, and Link Map) fields are required.",
                  status : 400
                });
              }
              if (!owner) {
                return res.status(400).json({
                  error: 1,
                  data : [],
                  message: "Owner field is required.",
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
                name_ar,
                name_en,
                added_by: {
                    id : user._id,
                    name  : user.name,
                    email : user.email,
                },
                description_ar: description_ar || "",
                description_en: description_en || "",
                bathrooms: parseInt(bathrooms),
                bedrooms: parseInt(bedrooms),
                beds: parseInt(beds),
                guests: parseInt(guests),
                city,
                type,
                region,
                street,
                building,
                floor,
                furnishing,
                ready,
                owner,
              };
            const featuresArray = []
            for (const element of features || []) {

                const featureRootExist = await feature.findById(element.id)
                
                if(!featureRootExist){
                    return res.status(400).json({
                        error: 1,
                        data: [],
                        message: "There are root feature is provided not found",
                        status: 400,
                      }); 
                }
                let children  = []
                for (const child of element.subFeatures || []) {
                    const subFeatureExist = featureRootExist.subFeatures.find(e=> e._id.toString() == child.toString())
                    if(!subFeatureExist){
                        return res.status(400).json({
                            error: 1,
                            data: [],
                            message: "There are sub feature is provided not found",
                            status: 400,
                          }); 
                    }
                    children.push({
                        id : subFeatureExist._id,
                        name_ar : subFeatureExist.name_ar,
                        name_en : subFeatureExist.name_en,
                        file : subFeatureExist.photo,
                    })
                }
                featuresArray.push({
                    id : featureRootExist._id,
                    name_ar : featureRootExist.name_ar,
                    name_en : featureRootExist.name_en,
                    file : featureRootExist.photo,
                    subFeatures : children
                })
                
            } 
            data["features"] = featuresArray
            if (!req.files) {
                return res.status(500).json({
                            error: 1,
                            data: [],
                            message: 'No file provided for upload.', 
                            status: 400
                        });
              }
              
            data.files = req.fileInfos;
            const propertySave = new property(data);
            await propertySave.save();
    
            res.status(200).json({
                error : 0,
                data : propertySave,
                message : "Add Property successfully!"
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
const UpdateProperty = async (req, res) => {
    const { id } = req.params; // Get the ID from the URL parameter
    const {name_ar, name_en , description_ar , description_en, features , type , files , furnishing , ready , owner ,
        bathrooms ,bedrooms , beds , guests , city , region, street, building , floor  } = req.body

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

        // Find the Property by ID first
        const existingProperty = await property.findById(id);

        if (!existingProperty) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "Property not found.",
                status: 404
            });
        }

        if((name_ar != undefined && name_ar == "") || (name_en != undefined && name_en == "") ){
            return res.status(400).json({
                error: 1,
                data : [],
                message: "Name fields are required.",
                status : 400
              });
        }
          if ((furnishing  != undefined &&  !['1', '0'].includes(furnishing)) || ( ready != undefined &&  !['1', '0'].includes(ready)) ) {
            return res.status(400).json({
              error: 1,
              data : [],
              message: "( Furnishing and Ready ) fields are required.",
              status : 400
            });
          }
          
          const isValidNumber = (value) => {
            return value != null && !isNaN(value) && /^[0-9]+$/.test(value.toString());
          };
          if (( bathrooms != undefined && !isValidNumber(bathrooms)) ||
              ( bedrooms != undefined && !isValidNumber(bedrooms)) ||
              ( beds != undefined && !isValidNumber(beds)) ||
              ( guests != undefined && !isValidNumber(guests)) ) {
            return res.status(400).json({
              error: 1,
              data: [],
              message: "(Bathrooms, Bedrooms, Beds, and Guests) fields must be valid numbers.",
              status: 400,
            });
          }
          if((city != undefined && city == "") || (region != undefined && region == "") ||
           (street != undefined && street == "") || (building != undefined && building == "") || (floor != undefined && floor == "") ){
            return res.status(400).json({
                error: 1,
                data : [],
                message: "( City, Region, Street, Building, and Floor) fields are required.",
                status : 400
            });
        }
          const featuresArray = []
          if( features != undefined  && features.length>0){
            for (const element of features || []) {
                const featureRootExist = await feature.findById(element.id)
                if(!featureRootExist){
                    return res.status(400).json({
                        error: 1,
                        data: [],
                        message: "There are root feature is provided not found",
                        status: 400,
                      }); 
                }
                let children  = []
                
                for (const child of element.subFeatures || []) {
                    const subFeatureExist = featureRootExist.subFeatures.find(e=> e._id.toString() == child.toString())
                    if(!subFeatureExist){
                        return res.status(400).json({
                            error: 1,
                            data: [],
                            message: "There are sub feature is provided not found",
                            status: 400,
                          }); 
                    }
                    children.push({id : subFeatureExist._id,
                        name_ar : subFeatureExist.name_ar,
                        name_en : subFeatureExist.name_en,
                        file : subFeatureExist.photo,})
                }
                featuresArray.push({
                    id : featureRootExist._id,
                    name_ar : featureRootExist.name_ar,
                    name_en : featureRootExist.name_en,
                    file : featureRootExist.photo,
                    subFeatures : children
                })
                
            } 
          }
        // Merge existing data with the new data, only updating provided fields
        const updatedData = {
            name_ar : name_ar ?? existingProperty.name_ar,
            name_en : name_en ?? existingProperty.name_en,
            description_ar : description_ar ?? existingProperty.description_ar,
            description_en : description_en ?? existingProperty.description_en,
            type : type ?? existingProperty.type,
            furnishing : furnishing ?? existingProperty.furnishing,
            ready : ready ?? existingProperty.ready,
            owner : owner ?? existingProperty.owner,
            bathrooms : bathrooms ?? existingProperty.bathrooms,
            bedrooms : bedrooms ?? existingProperty.bedrooms,
            beds : beds ?? existingProperty.beds,
            guests : guests ?? existingProperty.guests,
            city : city ?? existingProperty.city,
            region : region ?? existingProperty.region,
            street : street ?? existingProperty.street,
            building : building ?? existingProperty.building,
            floor : floor ?? existingProperty.floor,
            features : featuresArray.length>0 ?featuresArray : existingProperty.features 
        };
        
        // Find and delete the user by id
        const propertyToUpdate = await property.findOneAndUpdate(
            { _id: id },  // Find the document by ID
             updatedData,
            { new: true }  // Ensure the updated document is returned
        );
        
        if (!propertyToUpdate) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "Property not found.",
                status: 404
            });
        }
        // If a new photo is uploaded, handle it
       
        // if (req.file) {
        //               // Delete the old photo from Vercel Blob (if it exists)
        //               if (propertyToUpdate.files) {
        //                 const oldPhotoUrl = propertyToUpdate.file.url;
        //                 const oldFileName = oldPhotoUrl.split('/').pop(); // Extract file name from the URL
        
        //                 try {
        //                     await del(oldFileName, {
        //                         token: process.env.BLOB_XX_ABCDEFGHIJKLMNOPQRSTUVWXY_READ_WRITE_TOKEN
        //                     });
        //                     console.log(`Deleted old photo: ${oldFileName}`);
        //                 } catch (deleteError) {
        //                     console.warn('Failed to delete previous photo:', deleteError);
        //                     // Continue with the update even if deletion fails
        //                 }
        //             }
        
        //             // Update the photo field with the new file URL from Vercel Blob
        //             userToUpdate.file = req.fileInfo;
                
        // }
        
        if(req.files && req.files.length>0){
            const dataFiles = req.fileInfos;
            const filesExist = propertyToUpdate.files
            dataFiles.forEach(element => {
                filesExist.push(element)
            });
            updatedData.files = filesExist;
        }
        await propertyToUpdate.save();
        // Respond with a success message
        res.status(200).json({
            error: 0,
            data:propertyToUpdate,
            message: "Property updated successfully."
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
const DeleteProperty = async (req, res) => {
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
        const propertyToDelete = await property.findByIdAndDelete(id);

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

const GetAllProperty = async (req, res) => {
    try {
         // Extract page and limit from query parameters
         const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
         const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
 
         // Calculate the number of items to skip
         const skip = (page - 1) * limit;
       
         // Fetch types with pagination
         const data = await property.find()
             .skip(skip)
             .limit(limit);
 
         // Get total number of items for metadata
         const totalItems = await property.countDocuments();
 
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
const GetOneProperty = async (req, res) => {
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
        const existingProperty = await property.findById(id);

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
    AddProperty,
    DeleteProperty,
    UpdateProperty,
    GetOneProperty,
    GetAllProperty
}