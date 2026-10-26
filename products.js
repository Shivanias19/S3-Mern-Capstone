const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const Product = require('../models/Product');

// ─── Validation helpers ───────────────────────────────────────────────────────
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 200 }),
  body('brand').trim().notEmpty().withMessage('Brand is required').isLength({ max: 100 }),
  body('model').trim().notEmpty().withMessage('Model is required').isLength({ max: 100 }),
  body('serialNumber').trim().notEmpty().withMessage('Serial number is required').isLength({ max: 100 }),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'TV', 'Appliance', 'Camera', 'Audio', 'Gaming', 'Wearable', 'Other']),
  body('purchaseDate').notEmpty().withMessage('Purchase date is required').isISO8601().withMessage('Invalid purchase date'),
  body('warrantyExpiry').notEmpty().withMessage('Warranty expiry date is required').isISO8601().withMessage('Invalid warranty expiry date'),
  body('description').optional().trim().isLength({ max: 1000 }),
];

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return null;
}

// ─── QR Code helper ────────────────────────────────────────────────────────────
async function generateAndSaveQRCode(productId, clientUrl) {
  const passportUrl = `${clientUrl || 'http://localhost:5173'}/passport/${productId}`;
  const qrDir = path.join(__dirname, '../../public/qrcodes');
  if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

  const filename = `${productId}.png`;
  const filepath = path.join(qrDir, filename);

  await QRCode.toFile(filepath, passportUrl, {
    color: { dark: '#0f172a', light: '#ffffff' },
    width: 300,
    margin: 2,
  });

  return {
    qrCodeUrl: `/qrcodes/${filename}`,
    passportUrl,
  };
}

// ─── POST /api/products ────────────────────────────────────────────────────────
router.post('/', productValidation, async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const { name, brand, model, serialNumber, category, purchaseDate, warrantyExpiry, description } = req.body;

    // Check duplicate serial number
    const existing = await Product.findOne({ serialNumber: serialNumber.trim().toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A product with serial number "${serialNumber.toUpperCase()}" already exists.`,
      });
    }

    const product = new Product({ name, brand, model, serialNumber, category, purchaseDate, warrantyExpiry, description });
    await product.save();

    // Generate QR code
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const { qrCodeUrl, passportUrl } = await generateAndSaveQRCode(product._id.toString(), clientUrl);
    product.qrCodeUrl = qrCodeUrl;
    product.passportUrl = passportUrl;
    await product.save();

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Serial number already exists.' });
    }
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: 'Server error while creating product.' });
  }
});

// ─── GET /api/products ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, category, warrantyStatus, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(filter),
    ]);

    // Apply warrantyStatus filter on virtualised field
    let filtered = products;
    if (warrantyStatus) {
      filtered = products.filter((p) => p.warrantyStatus === warrantyStatus);
    }

    res.json({
      success: true,
      data: filtered,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('List products error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching products.' });
  }
});

// ─── GET /api/products/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/products/:id/passport ───────────────────────────────────────────
router.get('/:id/passport', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const RepairRecord = require('../models/RepairRecord');
    const repairs = await RepairRecord.find({ product: product._id }).sort({ sequenceNumber: 1 });

    res.json({ success: true, data: { product, repairs } });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/products/:id/qrcode ─────────────────────────────────────────────
router.get('/:id/qrcode', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Regenerate if missing
    if (!product.qrCodeUrl) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const { qrCodeUrl, passportUrl } = await generateAndSaveQRCode(product._id.toString(), clientUrl);
      product.qrCodeUrl = qrCodeUrl;
      product.passportUrl = passportUrl;
      await product.save();
    }

    res.json({ success: true, data: { qrCodeUrl: product.qrCodeUrl, passportUrl: product.passportUrl } });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
