// use Passport.js instead here if wish to auth with Facebook / Google etc

const jwt = require('jsonwebtoken');
const config = require('config');

// (request, response, next)
module.exports = function (req, res, next) {
  // get token from header
  const token = req.header('x-auth-token');

  // check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' }); // not authorised
  }

  // verify token if there is one
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
