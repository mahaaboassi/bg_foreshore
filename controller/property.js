const mongoose = require("mongoose")
const feature = require("../models/feature");
const property  = require("../models/Property");
const Type = require("../models/Type");
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
              
            const typeExist = await Type.findById(type)
            if (!typeExist ) {
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
             
                const user = await User.findById(req.user.id)
                if(!user){
                    return res.status(400).json({
                        error: 1,
                        data : [],
                        message: "User not found.",
                        status : 400
                        });
                }
                const ownerExist = await User.findById(owner)
                if (!ownerExist) {
                    return res.status(400).json({
                      error: 1,
                      data : [],
                      message: "Owner field is required.",
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
                type:{
                    _id :typeExist._id,
                    name_en : typeExist.name_en,
                    name_ar : typeExist.name_ar,
                    description_en : typeExist.description_en,
                    description_ar : typeExist.description_ar
                },
                region,
                street,
                building,
                floor,
                link_map,
                furnishing,
                registration_number,
                ready,
                owner:{
                    id : ownerExist._id,
                    name  : ownerExist.name,
                    email : ownerExist.email,
                },
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
                        icon : subFeatureExist.icon,
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
    const {name_ar, name_en , description_ar , description_en, features , type , files , furnishing,registration_number , ready , owner , rms_link,
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
        if (rms_link != undefined && rms_link == "") {
            return res.status(400).json({
              error: 1,
              data : [],
              message: "Rms Link field is required.",
              status : 400
            });
          }
        if (registration_number != undefined && registration_number == "") {
            return res.status(400).json({
              error: 1,
              data : [],
              message: "Registration Number field is required.",
              status : 400
            });
          }
        let typeExist = {}
        if (type != undefined  ) {
            typeExist = await Type.findById(type)
            if (!typeExist ) {
                return res.status(400).json({
                  error: 1,
                  data : [],
                  message: "Type field is required.",
                  status : 400
                });
              }
        }
        let ownerExist = {}
        if(owner != undefined && owner == "" ){
            ownerExist = await User.findById(owner)
            if (!ownerExist) {
                return res.status(400).json({
                  error: 1,
                  data : [],
                  message: "Owner field is required.",
                  status : 400
                });
              }
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
                    children.push({
                        id : subFeatureExist._id,
                        name_ar : subFeatureExist.name_ar,
                        name_en : subFeatureExist.name_en,
                        icon : subFeatureExist.icon,
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
          }
        // Merge existing data with the new data, only updating provided fields
        const updatedData = {
            name_ar : name_ar ?? existingProperty.name_ar,
            name_en : name_en ?? existingProperty.name_en,
            description_ar : description_ar ?? existingProperty.description_ar,
            description_en : description_en ?? existingProperty.description_en,
            type : Object.keys(typeExist).length>0 ? {
                _id :typeExist._id,
                name_en : typeExist.name_en,
                name_ar : typeExist.name_ar,
                description_en : typeExist.description_en,
                description_ar : typeExist.description_ar
            } : existingProperty.type,
            furnishing : furnishing ?? existingProperty.furnishing,
            ready : ready ?? existingProperty.ready,
            owner : Object.keys(ownerExist).length>0 ? {
                id : ownerExist._id,
                name  : ownerExist.name,
                email : ownerExist.email,
            } : existingProperty.owner,
            bathrooms : bathrooms ?? existingProperty.bathrooms,
            bedrooms : bedrooms ?? existingProperty.bedrooms,
            beds : beds ?? existingProperty.beds,
            guests : guests ?? existingProperty.guests,
            city : city ?? existingProperty.city,
            region : region ?? existingProperty.region,
            street : street ?? existingProperty.street,
            building : building ?? existingProperty.building,
            floor : floor ?? existingProperty.floor,
            rms_link : rms_link ?? existingProperty.rms_link,
            registration_number : registration_number ?? existingProperty.registration_number,
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
        // Extract query parameters
        const { page = 1, limit = 10, city, guests, type , owner } = req.query;

        // Convert page and limit to numbers
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;

        // Calculate the number of items to skip
        const skip = (pageNumber - 1) * limitNumber;

        // Build search query
        let query = {};
        if (owner) {
            if (mongoose.Types.ObjectId.isValid(owner)) {
                query["owner.id"] = new mongoose.Types.ObjectId(owner);
            } else {
                return res.status(400).json({
                    error: 1,
                    message: "Invalid owner ID format",
                    status: 400,
                });
            }
        }

        if (city) {
            query.city = { $regex: city, $options: "i" }; // Case-insensitive search
        }

        if (guests) {
            query.guests = parseInt(guests); // Match exact number of guests
        }

        if (type) {
            query["$or"] = [
                { "type.name_en": { $regex: type, $options: "i" } },
                { "type.name_ar": { $regex: type, $options: "i" } }
            ];
        }
        // Fetch properties with filters and pagination
        const data = await property.find(query)
            .skip(skip)
            .limit(limitNumber);

        // Get total number of items for metadata
        const totalItems = await property.countDocuments(query);

        // Calculate total pages
        const allPages = Math.ceil(totalItems / limitNumber);
        const lastPage = allPages > 0 ? allPages : 1;
        // Check if data exists
        if (!data || data.length === 0) {
            return res.status(404).json({
                error: 1,
                data: [],
                message: "No properties found.",
                status: 404
            });
        }

        // Respond with the fetched properties
        res.status(200).json({
            error: 0,
            data,
            message: "Properties fetched successfully.",
            meta: {
                current_page: pageNumber,
                total: totalItems,
                per_page: limitNumber,
                all_pages: allPages,
                last_page: lastPage,
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
};

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
    GetAllProperty,
     
}