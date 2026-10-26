
const express = require('express');
const router = express.Router({ mergeParams: true });
const { body, validationResult } = require('express-validator');

const RepairRecord = require('../models/RepairRecord');
const Product = require('../models/Product');
const {
  computeRecordHash,
  verifyAuditChain,
  GENESIS_HASH,
} = require('../utils/audit');

// ─── Validation ───────────────────────────────────────────────────────────────

const repairValidation = [
  body('repairDate')
    .notEmpty()
    .withMessage('Repair date is required')
    .isISO8601()
    .withMessage('Invalid repair date'),

  body('problemDescription')
    .trim()
    .notEmpty()
    .withMessage('Problem description is required')
    .isLength({ max: 1000 }),

  body('repairAction')
    .trim()
    .notEmpty()
    .withMessage('Repair action is required')
    .isLength({ max: 1000 }),

  body('replacedParts')
    .optional()
    .isArray()
    .withMessage('Replaced parts must be an array'),

  body('repairCost')
    .notEmpty()
    .withMessage('Repair cost is required')
    .isFloat({ min: 0 })
    .withMessage('Repair cost must be a non-negative number'),

  body('technicianName')
    .trim()
    .notEmpty()
    .withMessage('Technician name is required')
    .isLength({ max: 200 }),

  body('serviceStatus')
    .notEmpty()
    .withMessage('Service status is required')
    .isIn(['completed', 'in_progress', 'pending', 'cancelled'])
    .withMessage('Invalid service status'),
];

function handleValidation(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
    return false;
  }

  return true;
}

function getRepairSort() {
  return { sequenceNumber: 1, _id: 1 };
}

// ─── POST /api/products/:id/repairs ──────────────────────────────────────────

router.post('/:id/repairs', repairValidation, async (req, res) => {
  if (!handleValidation(req, res)) return;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const {
      repairDate,
      problemDescription,
      repairAction,
      replacedParts,
      repairCost,
      technicianName,
      serviceStatus,
    } = req.body;

    // Determine the previous record for this product.
    const lastRecord = await RepairRecord.findOne({
      product: product._id,
    }).sort({ sequenceNumber: -1, _id: -1 });

    const previousHash = lastRecord
      ? lastRecord.recordHash
      : GENESIS_HASH;

    const sequenceNumber = lastRecord
      ? lastRecord.sequenceNumber + 1
      : 1;

    // Let Mongoose cast and normalize the values first.
    const repairRecord = new RepairRecord({
      product: product._id,
      repairDate: new Date(repairDate),
      problemDescription,
      repairAction,
      replacedParts: Array.isArray(replacedParts)
        ? replacedParts
        : [],
      repairCost: Number(repairCost),
      technicianName,
      serviceStatus,
      previousHash,
      sequenceNumber,

      // Temporary placeholder; replaced with the calculated hash below.
      recordHash: GENESIS_HASH,
    });

    // Apply schema casting, defaults and setters before hashing.
    await repairRecord.validate();

    // Hash the same normalized values that verification will read.
    repairRecord.recordHash = computeRecordHash(repairRecord);

    await repairRecord.save();

    return res.status(201).json({
      success: true,
      data: repairRecord,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      });
    }

    console.error('Add repair error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error while adding repair record.',
    });
  }
});

// ─── GET /api/products/:id/repairs ───────────────────────────────────────────

router.get('/:id/repairs', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const repairs = await RepairRecord.find({
      product: product._id,
    }).sort(getRepairSort());

    return res.json({
      success: true,
      data: repairs,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      });
    }

    console.error('Get repairs error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching repair records.',
    });
  }
});

// ─── GET /api/products/:id/repairs/verify ────────────────────────────────────

router.get('/:id/repairs/verify', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const repairs = await RepairRecord.find({
      product: product._id,
    }).sort(getRepairSort());

    const disclaimer =
      'Hash verification confirms whether the saved records match their hash chain. ' +
      'It does not independently prove that the described repairs occurred physically.';

    if (repairs.length === 0) {
      return res.json({
        success: true,
        data: {
          valid: true,
          message: 'No repair records exist for this product.',
          details: [],
          tamperedAt: null,
          totalRecords: 0,
          disclaimer,
        },
      });
    }

    const result = verifyAuditChain(repairs);

    // Log diagnostics on the server only; do not expose record contents
    // unnecessarily in the public API response.
    if (!result.valid) {
      console.error('Audit verification failed:', {
        productId: String(product._id),
        details: result.details
          .filter((detail) => !detail.ok)
          .map((detail) => ({
            sequenceNumber: detail.sequenceNumber,
            recordId: detail.recordId,
            sequenceOk: detail.sequenceOk,
            prevHashOk: detail.prevHashOk,
            hashOk: detail.hashOk,
            error: detail.error,
          })),
      });
    }

    return res.json({
      success: true,
      data: {
        ...result,
        totalRecords: repairs.length,
        disclaimer,
      },
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      });
    }

    console.error('Verify audit error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error during audit verification.',
    });
  }
});

module.exports = router;
