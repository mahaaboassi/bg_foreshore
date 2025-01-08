const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const {router} = require("./route/auth");
const { adminRouter } = require('./route/admin');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());
// Connect MongoDB
connectDB()
// Default Route
app.get('/', (req, res) => {
    res.send('Welcome to My Node.js Project!');
});

// Auth APIs
app.use("/api/auth", router);
// Admin APIs
app.use("/api/admin", adminRouter);

app.use("/uploads",express.static("uploads"))
// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});