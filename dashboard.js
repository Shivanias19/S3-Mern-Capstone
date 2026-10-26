const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const RepairRecord = require('../models/RepairRecord');

// ─── GET /api/dashboard/stats ─────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalProducts, totalRepairs, allProducts, recentProducts] = await Promise.all([
      Product.countDocuments(),
      RepairRecord.countDocuments(),
      Product.find({}, 'warrantyExpiry'),
      Product.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let activeWarranty = 0;
    let expiringSoon = 0;
    let expiredWarranty = 0;

    for (const p of allProducts) {
      const expiry = new Date(p.warrantyExpiry);
      if (expiry < now) {
        expiredWarranty++;
      } else if (expiry <= thirtyDaysFromNow) {
        expiringSoon++;
      } else {
        activeWarranty++;
      }
    }

    // Products needing repair = those with an in_progress repair record
    const needingRepair = await RepairRecord.distinct('product', { serviceStatus: 'in_progress' });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalRepairs,
        activeWarranty,
        expiringSoon,
        expiredWarranty,
        needingRepair: needingRepair.length,
        recentProducts,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching dashboard stats.' });
  }
});

module.exports = router;
