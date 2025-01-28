const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
        return res.status(403).json({
            error: 1,
            data: [],
            message: "Token is required for authentication.",
            status: 403,
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded user info to request
        // If the token is expired and we want to refresh it
        const isTokenExpired = decoded.exp * 1000 < Date.now(); // Check if the token has expired
        if (isTokenExpired) {
            const refreshedToken = jwt.sign({ userId: decoded.userId, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.setHeader('Authorization', `Bearer ${refreshedToken}`); // Send the new token in the response header
        }
  
        next();
    } catch (error) {
        const message = error.name === "TokenExpiredError" ? "Token has expired." : "Authentication failed.";
        return res.status(401).json({ error: 1, data: [], message, status: 401 });
    }
};

const authorizeAdmin = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
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
    req.user = decoded;
    next();
};

module.exports = { authenticate, authorizeAdmin };