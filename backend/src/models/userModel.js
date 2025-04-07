const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password is required only if googleId is not present
      },
      minlength: 6
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true
    },
    avatar: {
      type: String,
      default: ''
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false
    },
    isSeller: {
      type: Boolean,
      required: true,
      default: false
    },
    sellerInfo: {
      businessName: { type: String },
      phoneNumber: { type: String },
      address: { type: String },
      taxId: { type: String },
      description: { type: String }
    },
    cart: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  try {
    console.log('Hashing password for user:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    console.log('Matching password for user:', this.email);
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error matching password:', error);
    return false;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User; 