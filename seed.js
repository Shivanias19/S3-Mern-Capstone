require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const Product = require('./src/models/Product');
const RepairRecord = require('./src/models/RepairRecord');
const { computeRecordHash } = require('./src/utils/audit');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-product-passport';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

async function generateQR(productId) {
  const passportUrl = `${CLIENT_URL}/passport/${productId}`;
  const qrDir = path.join(__dirname, 'public/qrcodes');
  if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
  const filename = `${productId}.png`;
  const filepath = path.join(qrDir, filename);
  await QRCode.toFile(filepath, passportUrl, {
    color: { dark: '#0f172a', light: '#ffffff' },
    width: 300,
    margin: 2,
  });
  return { qrCodeUrl: `/qrcodes/${filename}`, passportUrl };
}

const productsData = [
  {
    name: 'MacBook Pro 14"',
    brand: 'Apple',
    model: 'MacBook Pro 14-inch M3',
    serialNumber: 'MBP-2024-001-XK7',
    category: 'Laptop',
    purchaseDate: new Date('2024-01-15'),
    warrantyExpiry: new Date('2027-01-15'),
    description: 'Apple MacBook Pro with M3 chip, 16GB RAM, 512GB SSD. Used for software development.',
  },
  {
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    model: 'A3293',
    serialNumber: 'IP15P-2023-XF9-002',
    category: 'Smartphone',
    purchaseDate: new Date('2023-10-01'),
    warrantyExpiry: new Date('2024-10-01'),
    description: 'Apple iPhone 15 Pro in Natural Titanium with 256GB storage.',
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    model: 'SM-S928B',
    serialNumber: 'SGS24U-2024-003-YT4',
    category: 'Smartphone',
    purchaseDate: new Date('2024-02-20'),
    warrantyExpiry: new Date('2026-02-20'),
    description: 'Samsung Galaxy S24 Ultra 512GB in Titanium Black with S Pen.',
  },
  {
    name: 'Dell XPS 15',
    brand: 'Dell',
    model: 'XPS 15 9530',
    serialNumber: 'DXPS-9530-2023-004',
    category: 'Laptop',
    purchaseDate: new Date('2023-06-10'),
    warrantyExpiry: new Date('2026-06-10'),
    description: 'Dell XPS 15 with Intel Core i9-13900H, 32GB RAM, 1TB NVMe SSD.',
  },
  {
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    model: 'WH-1000XM5',
    serialNumber: 'SWXM5-2023-005-PQ1',
    category: 'Audio',
    purchaseDate: new Date('2023-08-22'),
    warrantyExpiry: new Date('2025-08-22'),
    description: 'Sony WH-1000XM5 wireless noise-cancelling headphones in Midnight Black.',
  },
  {
    name: 'LG OLED C3 65"',
    brand: 'LG',
    model: 'OLED65C3PSA',
    serialNumber: 'LGOLED65-2024-006-AB8',
    category: 'TV',
    purchaseDate: new Date('2024-03-05'),
    warrantyExpiry: new Date('2027-03-05'),
    description: 'LG 65-inch OLED evo C3 4K Smart TV with WebOS and Dolby Vision.',
  },
  {
    name: 'Canon EOS R5',
    brand: 'Canon',
    model: 'EOS R5 Mark II',
    serialNumber: 'CEOSR5-2024-007-MN3',
    category: 'Camera',
    purchaseDate: new Date('2024-04-18'),
    warrantyExpiry: new Date('2026-04-18'),
    description: 'Canon EOS R5 Mark II full-frame mirrorless camera with 45MP sensor.',
  },
];

const repairsData = [
  // MacBook Pro repairs
  {
    productIndex: 0,
    records: [
      {
        repairDate: new Date('2024-06-10'),
        problemDescription: 'Keyboard keys sticking, particularly the spacebar and the "E" key.',
        repairAction: 'Cleaned keyboard mechanism with compressed air and isopropyl alcohol. Replaced top case assembly.',
        replacedParts: ['Top case assembly with keyboard'],
        repairCost: 320,
        technicianName: 'James Whitfield',
        serviceStatus: 'completed',
      },
      {
        repairDate: new Date('2024-09-03'),
        problemDescription: 'Battery health dropped to 72% within 8 months, significantly below expected degradation.',
        repairAction: 'Ran Apple diagnostics confirming premature battery degradation. Replaced battery under extended warranty.',
        replacedParts: ['Li-Po Battery 70Wh'],
        repairCost: 0,
        technicianName: 'Sarah Chen',
        serviceStatus: 'completed',
      },
    ],
  },
  // iPhone 15 Pro repairs
  {
    productIndex: 1,
    records: [
      {
        repairDate: new Date('2024-03-15'),
        problemDescription: 'Cracked screen after accidental drop. Touchscreen unresponsive in lower-right quadrant.',
        repairAction: 'Replaced display assembly including OLED screen, digitizer, and protective glass. Calibrated Face ID.',
        replacedParts: ['Super Retina XDR OLED Display Assembly'],
        repairCost: 279,
        technicianName: 'Marcus Rivera',
        serviceStatus: 'completed',
      },
    ],
  },
  // Samsung Galaxy repairs
  {
    productIndex: 2,
    records: [
      {
        repairDate: new Date('2024-08-20'),
        problemDescription: 'S Pen not being detected intermittently. Stylus tip visibly worn.',
        repairAction: 'Replaced S Pen tip with official Samsung replacement kit. Updated EMR firmware.',
        replacedParts: ['S Pen Replacement Tip Kit'],
        repairCost: 45,
        technicianName: 'Linda Park',
        serviceStatus: 'completed',
      },
      {
        repairDate: new Date('2024-10-01'),
        problemDescription: 'Device running hot during normal usage. Battery draining rapidly.',
        repairAction: 'Cleaned thermal pads and re-applied thermal compound. Updated software. Under investigation.',
        replacedParts: [],
        repairCost: 80,
        technicianName: 'Tom Nakamura',
        serviceStatus: 'in_progress',
      },
    ],
  },
  // Dell XPS repairs
  {
    productIndex: 3,
    records: [
      {
        repairDate: new Date('2023-11-28'),
        problemDescription: 'Laptop overheating during intensive tasks, thermal throttling observed.',
        repairAction: 'Disassembled chassis, cleaned dust from heat pipes and fan, replaced thermal paste on CPU and GPU.',
        replacedParts: ['Thermal Paste (Conductonaut Extreme)'],
        repairCost: 95,
        technicianName: 'Alex Thompson',
        serviceStatus: 'completed',
      },
      {
        repairDate: new Date('2024-07-14'),
        problemDescription: 'Left speaker producing crackling sounds at medium to high volumes.',
        repairAction: 'Replaced left speaker assembly. Verified audio quality across all frequency ranges.',
        replacedParts: ['Left Speaker Assembly 2W'],
        repairCost: 120,
        technicianName: 'Rachel Kim',
        serviceStatus: 'completed',
      },
    ],
  },
  // Sony headphones repairs
  {
    productIndex: 4,
    records: [
      {
        repairDate: new Date('2024-05-08'),
        problemDescription: 'Right ear cup producing intermittent audio cut-outs and static noise.',
        repairAction: 'Replaced right audio driver unit. Ran 48-hour burn-in test to confirm repair.',
        replacedParts: ['Right Audio Driver 40mm'],
        repairCost: 85,
        technicianName: 'David Martinez',
        serviceStatus: 'completed',
      },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await RepairRecord.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Insert products
    const createdProducts = [];
    for (const pd of productsData) {
      const product = new Product(pd);
      await product.save();
      const { qrCodeUrl, passportUrl } = await generateQR(product._id.toString());
      product.qrCodeUrl = qrCodeUrl;
      product.passportUrl = passportUrl;
      await product.save();
      createdProducts.push(product);
      console.log(`📦 Created product: ${product.name} (${product.serialNumber})`);
    }

    // Insert repair records with hash chaining
    for (const repairGroup of repairsData) {
      const product = createdProducts[repairGroup.productIndex];
      let previousHash = '0'.repeat(64);
      let sequenceNumber = 1;

      for (const record of repairGroup.records) {
        const recordData = {
          product: product._id,
          ...record,
          previousHash,
          sequenceNumber,
        };
        const recordHash = computeRecordHash(recordData);
        const repairRecord = new RepairRecord({ ...recordData, recordHash });
        await repairRecord.save();
        previousHash = recordHash;
        sequenceNumber++;
        console.log(`  🔧 Added repair #${repairRecord.sequenceNumber} for ${product.name}`);
      }
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log(`   ${createdProducts.length} products created`);
    const totalRepairs = repairsData.reduce((sum, r) => sum + r.records.length, 0);
    console.log(`   ${totalRepairs} repair records created`);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

seed();
