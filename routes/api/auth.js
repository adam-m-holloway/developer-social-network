const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const { check, validationResult } = require('express-validator'); // uses validator.js form validation server side

const User = require('../../models/User');

// @route     GET api/auth
// @desc      Test route
// @access    Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // get user by ID but EXCLUDE the password
    res.json(user); // return the user
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

// @route     POST api/auth
// @desc      Authenticate user and get token
// @access    Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // get user by email address
      let user = await User.findOne({ email });

      // if user does NOT exists
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Make sure password matches
      const isMatch = await bcrypt.compare(password, user.password); // (userEnteredPassword, saveInDbPassword);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Get the user by ID
      const payload = {
        user: {
          id: user.id,
        },
      };

      // Sign the token
      jwt.sign(
        payload,
        config.get('jwtSecret'), // gets secret from `config/defaults.json`
        {
          expiresIn: 360000, // TODO: change to 3600 for prod
        },
        (error, token) => {
          if (error) throw error; // if error throw error
          res.json({ token }); // send token  back to client
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error'); // returns 500 error with a message of "Server error"
    }
  }
);
