const express = require("express");
const { AddType, UpdateType, DeleteType, GetType } = require("../controller/type");
const { upload , uploadToVercelBlob , setCategory } = require('../middleware/uploads');
const { authenticate , authorizeAdmin} = require("../middleware/auth")
const { Add, Update, Delete, Get, AddSubFeature, UpdateSubFeature, DeleteSubFeature } = require("../controller/feature");

const adminRouter = express.Router();


// Route to add a new type
adminRouter.post("/addType", setCategory('type'), authenticate,authorizeAdmin,upload.single("photo"),uploadToVercelBlob, AddType);
adminRouter.put("/updateType/:id",setCategory('type'), upload.single("photo"),UpdateType);
adminRouter.delete("/deleteType/:id", DeleteType);
adminRouter.get("/getAllTypes", GetType);
// Route to add a new feature
adminRouter.post("/addFeature", setCategory('feature'),upload.single("photo"), Add);
adminRouter.put("/updateFeature/:id",setCategory('feature'), upload.single("photo"), Update);
adminRouter.delete("/deleteFeature/:id", Delete);
adminRouter.get("/getAllFeatures", Get);
// Route to add a new sub feature
adminRouter.post("/addSubFeature", setCategory('feature'),upload.single("photo"), AddSubFeature);
adminRouter.put("/updateSubFeature/:id",setCategory('feature'), upload.single("photo"), UpdateSubFeature);
adminRouter.delete("/deleteSubFeature/:id", DeleteSubFeature);


module.exports = {adminRouter};