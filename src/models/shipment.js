require('dotenv').config();
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Track each status update (e.g., "in-transit", "out-for-delivery", etc.)
trackingHistorySchema = new Schema({
  status: {
    type: String,
    required: true,
  },
  location: {
    city: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  description: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Sender or receiver address (with coordinates for mapping)
addressSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phone: String,
  email: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
});

shipmentSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      unique: true,
      default: () => {
        const prefix = 'SW';
        const number = Math.floor(100000000 + Math.random() * 900000000);
        return `${prefix}${number}`;
      },
    },
    status: {
      type: String,
      enum: [
        'pending',
        'picked-up',
        'in-transit',
        'out-for-delivery',
        'delivered',
        'delayed',
        'cancelled',
      ],
      default: 'pending',
    },
    service: {
      type: String,
      enum: ['express', 'standard', 'economy'],
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        default: 'cm',
      },
    },
    // Current real-time location for map pointer
    currentLocation: {
      city: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    // Add editable destination field
    destination: {
      city: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    sender: {
      type: addressSchema,
      required: true,
    },
    receiver: {
      type: addressSchema,
      required: true,
    },
    trackingHistory: [trackingHistorySchema],
    estimatedDelivery: Date,
    actualDelivery: Date,
    price: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD',
      },
    },
    notes: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    // Auto-updated timestamps for sorting by last update
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update lastUpdated on every save
shipmentSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

//Generate tracking number
// shipmentSchema.pre('save', function (next) {
//   if (!this.trackingNumber) {
//     const prefix = 'SW';
//     const number = Math.floor(100000000 + Math.random() * 900000000);
//     this.trackingNumber = `${prefix}${number}`;
//   }
//   next();
// });

const Shipment = model('Shipment', shipmentSchema);
module.exports = Shipment;
