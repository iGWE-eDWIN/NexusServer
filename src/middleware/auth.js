// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// const auth = async (req, res, next) => {
//   const { authorization } = req.headers;
//   try {
//     if (!authorization) throw new Error('You must be logged in');

//     // Get value for header
//     const token = authorization.replace('Bearer ', '');
//     // const token = req.header('Authorization').replace('Bearer ', '');
//     // console.log(token);

//     // Validate token
//     const decoded = jwt.verify(token, process.env.JWT_Secret);
//     // console.log(decoded);

//     const user = await User.findOne({
//       _id: decoded._id,
//       'tokens.token': token,
//     });
//     // console.log(user);

//     if (!user) throw new Error('Please get authenticated');

//     req.user = user;
//     req.token = token;
//     next();
//   } catch (error) {
//     res.status(401).send({ error: error.message });
//   }
// };

// const adminAuth = (req, res, next) => {
//   try {
//     if (req.user.role !== 'admin') throw new Error('Admin access required');
//     next();
//   } catch (error) {
//     res.status(403).send({ error });
//   }
// };

// module.exports = {
//   auth,
//   adminAuth,
// };

const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to authenticate any logged-in user
const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer '))
      throw new Error('Authorization token required');

    const token = authorization.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_Secret);

    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) throw new Error('Authentication failed');

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Middleware to restrict access to admins only
const adminAuth = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new Error('Admin access required');
    }
    next();
  } catch (error) {
    res.status(403).json({ error: error.message || 'Access denied' });
  }
};

module.exports = {
  auth,
  adminAuth,
};
