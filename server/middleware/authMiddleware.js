const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  //  on Header  chack Authorization and starts  Bearer 
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // deletes "Bearer " from the token string and gets the actual token
      token = req.headers.authorization.split(' ')[1];

      //  Tokenኑን በ JWT_SECRET ማረጋገጥ
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // adds user info in  => req.user 
      req.user = decoded;

      next(); // passes to Controller 
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this resource.` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };