const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
const token = req.cookies.auth_token;

if (!token) {
return res.status(401).json({ error: "Not authenticated" });
}

try {
const decoded = jwt.verify(token, process.env.SECRET_KEY);
req.user = decoded; 
next();
} catch {
return res.status(401).json({ error: "Invalid token" });
}
};

module.exports = auth;