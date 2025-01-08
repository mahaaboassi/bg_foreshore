const express = require("express");
const { AddType, UpdateType, DeleteType, GetType } = require("../controller/type");
const uplaod = require('../middleware/uploads');
const { Add, Update, Delete, Get, AddSubFeature, UpdateSubFeature, DeleteSubFeature } = require("../controller/feature");

const adminRouter = express.Router();
// Middleware to set category for the "type" endpoint
const setCategory = (category) => (req, res, next) => {
    req.category = category; // Add category to the request object
    next();
};

// Route to add a new type
adminRouter.post("/addType", setCategory('type'),uplaod.single("photo"), AddType);
adminRouter.put("/updateType/:id",setCategory('type'), uplaod.single("photo"),UpdateType);
adminRouter.delete("/deleteType/:id", DeleteType);
adminRouter.get("/getAllTypes", GetType);
// Route to add a new feature
adminRouter.post("/addFeature", setCategory('feature'),uplaod.single("photo"), Add);
adminRouter.put("/updateFeature/:id",setCategory('feature'), uplaod.single("photo"), Update);
adminRouter.delete("/deleteFeature/:id", Delete);
adminRouter.get("/getAllFeatures", Get);
// Route to add a new sub feature
adminRouter.post("/addSubFeature", setCategory('feature'),uplaod.single("photo"), AddSubFeature);
adminRouter.put("/updateSubFeature/:id",setCategory('feature'), uplaod.single("photo"), UpdateSubFeature);
adminRouter.delete("/deleteSubFeature/:id", DeleteSubFeature);


module.exports = {adminRouter};