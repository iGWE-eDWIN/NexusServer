const User = require('../models/user');

// Admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(req.body);

    const user = await User.findByCredentials(email, password);
    if (user.role !== 'admin') throw new Error('Access denied. Not an admin');

    const token = await user.generateAuthToken();

    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const verifyAdmin = (req, res) => {
  res.status(200).send({ user: req.user });
};

module.exports = {
  loginAdmin,
  verifyAdmin,
};
