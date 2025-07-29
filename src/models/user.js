require('dotenv').config();
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { Schema, model } = mongoose;
const jwt = require('jsonwebtoken');
userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, 'Password must be at least 6 characters'],
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error(`Password can not contain 'Password'`);
        }
      },
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

// Generating jason web token (jwt) for authentication
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_Secret);
  user.tokens = user.tokens.concat({ token });
  await user.save({ validateBeforeSave: false });

  return token;
};

// Authenticating username and password
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  // console.log(user.password);
  // console.log(isMatch);
  if (!isMatch) throw new Error('Unable to login');

  return user;
};

// Creating a hashing middleware to hash the plain text password
userSchema.pre('save', async function (next) {
  const user = this;

  // Only hash password if it was moldified or hasn't been hashed
  if (!user.isModified('password')) {
    return next();
    // user.password = await bcrypt.hash(user.password, 8);
  }

  const salt = await bcrypt.genSalt(10);

  if (salt) user.password = await bcrypt.hash(user.password, salt);

  next();
  // console.log(user.password);
});

// // Hash password before saving
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();

//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Compare password method
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// Delete user_transaction when user is removed
userSchema.pre('remove', async function (next) {
  const user = this;

  //   await Transaction.deleteMany({ userId: user._id });

  next();
});

// create a collection
const User = model('User', userSchema);

module.exports = User;
