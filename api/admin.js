const express = require("express");
const { AddType, UpdateType, DeleteType, GetType } = require("../controller/type");
const { upload , uploadToVercelBlob ,handleFileUploadError, setCategory, uploadMulti, uploadToVercelBlobMulti } = require('../middleware/uploads');
const { authenticate , authorizeAdmin} = require("../middleware/auth")
const { Add, Update, Delete, Get, AddSubFeature, UpdateSubFeature, DeleteSubFeature, GetAllSubFeatures } = require("../controller/feature");
const { AddUser, UpdateUser, DeleteUser, GetAllUsers, GetOneUser } = require("../controller/user");
const { AddProperty, GetOneProperty, GetAllProperty, DeleteProperty, UpdateProperty } = require("../controller/property");
const { SendList } = require("../controller/sendProperty");
const { SendMessageToAdmin } = require("../controller/sendMessage");
const { SendSubscribe } = require("../controller/subscribe");


const adminRouter = express.Router();
// Route to add a new type
adminRouter.post("/addType", setCategory('type'), authenticate,authorizeAdmin,upload.single("photo"),handleFileUploadError,uploadToVercelBlob, AddType);
adminRouter.put("/updateType/:id",setCategory('type'),authenticate,authorizeAdmin,upload.single("photo"),handleFileUploadError,uploadToVercelBlob,UpdateType);
adminRouter.delete("/deleteType/:id",  authenticate , authorizeAdmin ,DeleteType);
adminRouter.get("/getAllTypes", GetType);
// Route to add a new feature
adminRouter.post("/addFeature", setCategory('feature'),authenticate,authorizeAdmin,upload.single("photo"),handleFileUploadError,uploadToVercelBlob, Add);
adminRouter.put("/updateFeature/:id",setCategory('feature'), authenticate,authorizeAdmin,upload.single("photo"),handleFileUploadError,uploadToVercelBlob, Update);
adminRouter.delete("/deleteFeature/:id",authenticate,authorizeAdmin, Delete);
adminRouter.get("/getAllFeatures", Get);
// Route to add a new sub feature
adminRouter.post("/addSubFeature", setCategory('feature'), authenticate,authorizeAdmin,upload.single("photo"),handleFileUploadError,uploadToVercelBlob, AddSubFeature);
adminRouter.put("/updateSubFeature/:id",setCategory('feature'), authenticate,authorizeAdmin,upload.single("photo"),handleFileUploadError,uploadToVercelBlob, UpdateSubFeature);
adminRouter.delete("/deleteSubFeature/:id",authenticate,authorizeAdmin, DeleteSubFeature);
adminRouter.get("/getAllSubFeatures", GetAllSubFeatures);
// Route to add a new User
adminRouter.post("/addUser", setCategory('user'), authenticate,authorizeAdmin,upload.single("file"),handleFileUploadError,uploadToVercelBlob, AddUser);
adminRouter.put("/updateUser/:id",setCategory('user'),authenticate,authorizeAdmin,upload.single("file"),handleFileUploadError,uploadToVercelBlob,UpdateUser);
adminRouter.delete("/deleteUser/:id",  authenticate , authorizeAdmin ,DeleteUser);
adminRouter.get("/getAllUsers", GetAllUsers);
adminRouter.get("/getUser/:id", GetOneUser);
// // Route to add a new Property
adminRouter.post("/addProperty", setCategory('property'), authenticate,authorizeAdmin,uploadMulti,handleFileUploadError,uploadToVercelBlobMulti, AddProperty);
adminRouter.put("/updateProperty/:id",setCategory('property'),authenticate,authorizeAdmin,uploadMulti,handleFileUploadError,uploadToVercelBlobMulti,UpdateProperty);
adminRouter.delete("/deleteProperty/:id",  authenticate , authorizeAdmin ,DeleteProperty);
adminRouter.get("/getAllPropertiesForUser",authenticate, GetAllProperty);
adminRouter.get("/getAllProperties", GetAllProperty);
adminRouter.get("/getProperty/:id", GetOneProperty);

// // List Property 
adminRouter.post("/list", setCategory('list'),uploadMulti,handleFileUploadError,uploadToVercelBlobMulti, SendList);
// // Contact us
adminRouter.post("/contactUS", SendMessageToAdmin);
// // Subscribe
adminRouter.post("/subscribe", SendSubscribe);


module.exports = {adminRouter};