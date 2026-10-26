const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters'],
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
      maxlength: [100, 'Model cannot exceed 100 characters'],
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [100, 'Serial number cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Smartphone',
        'Laptop',
        'Tablet',
        'Desktop',
        'TV',
        'Appliance',
        'Camera',
        'Audio',
        'Gaming',
        'Wearable',
        'Other',
      ],
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required'],
    },
    warrantyExpiry: {
      type: Date,
      required: [true, 'Warranty expiry date is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    qrCodeUrl: {
      type: String,
      default: null,
    },
    passportUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: warranty status
productSchema.virtual('warrantyStatus').get(function () {
  const now = new Date();
  const expiry = new Date(this.warrantyExpiry);
  const diffMs = expiry - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'active';
});

productSchema.virtual('warrantyDaysRemaining').get(function () {
  const now = new Date();
  const expiry = new Date(this.warrantyExpiry);
  return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
});

// Index for search
productSchema.index({ name: 'text', brand: 'text', model: 'text', serialNumber: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
