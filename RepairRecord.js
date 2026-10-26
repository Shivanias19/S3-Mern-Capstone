const mongoose = require('mongoose');

const repairRecordSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
    },
    repairDate: {
      type: Date,
      required: [true, 'Repair date is required'],
    },
    problemDescription: {
      type: String,
      required: [true, 'Problem description is required'],
      trim: true,
      maxlength: [1000, 'Problem description cannot exceed 1000 characters'],
    },
    repairAction: {
      type: String,
      required: [true, 'Repair action is required'],
      trim: true,
      maxlength: [1000, 'Repair action cannot exceed 1000 characters'],
    },
    replacedParts: {
      type: [String],
      default: [],
    },
    repairCost: {
      type: Number,
      required: [true, 'Repair cost is required'],
      min: [0, 'Repair cost cannot be negative'],
    },
    technicianName: {
      type: String,
      required: [true, 'Technician name is required'],
      trim: true,
      maxlength: [200, 'Technician name cannot exceed 200 characters'],
    },
    serviceStatus: {
      type: String,
      required: [true, 'Service status is required'],
      enum: ['completed', 'in_progress', 'pending', 'cancelled'],
      default: 'completed',
    },
    // Tamper-evident audit fields
    recordHash: {
      type: String,
      required: true,
    },
    previousHash: {
      type: String,
      required: true,
      default: '0000000000000000000000000000000000000000000000000000000000000000',
    },
    sequenceNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: product + sequence for ordered retrieval
repairRecordSchema.index({ product: 1, sequenceNumber: 1 });

const RepairRecord = mongoose.model('RepairRecord', repairRecordSchema);
module.exports = RepairRecord;
