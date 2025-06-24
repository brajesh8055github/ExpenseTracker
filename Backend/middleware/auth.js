const jwt = require("jsonwebtoken");
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log("No token provided");
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res.sendStatus(403);
    }

    req.userId = decoded.id;
    next();
  });
}


module.exports = auth;
