
const crypto = require('crypto');

const GENESIS_HASH = '0'.repeat(64);

/**
 * Convert a product reference to a stable string ID.
 */
function normalizeProductId(record) {
  const value = record.product ?? record.productId ?? '';

  if (value && typeof value === 'object') {
    return String(value._id ?? value.id ?? value);
  }

  return String(value);
}

/**
 * Normalize date values consistently.
 * Invalid or missing dates are rejected instead of silently hashed.
 */
function normalizeDate(value) {
  if (value === null || value === undefined || value === '') {
    throw new Error('Repair record is missing repairDate');
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Repair record has an invalid repairDate');
  }

  return date.toISOString();
}

/**
 * Create a deterministic audit payload.
 * Both hash creation and verification MUST use this function.
 */
function buildAuditPayload(record) {
  if (!record || typeof record !== 'object') {
    throw new Error('A valid repair record is required');
  }

  const repairCost = Number(record.repairCost);

  if (!Number.isFinite(repairCost) || repairCost < 0) {
    throw new Error('Repair cost must be a non-negative number');
  }

  const replacedParts = Array.isArray(record.replacedParts)
    ? record.replacedParts.map(String).sort()
    : [];

  const sequenceNumber = Number(record.sequenceNumber);

  if (!Number.isInteger(sequenceNumber) || sequenceNumber < 1) {
    throw new Error('sequenceNumber must be a positive integer');
  }

  return JSON.stringify({
    productId: normalizeProductId(record),
    repairDate: normalizeDate(record.repairDate),
    problemDescription: String(record.problemDescription ?? ''),
    repairAction: String(record.repairAction ?? ''),
    replacedParts,
    repairCost,
    technicianName: String(record.technicianName ?? ''),
    serviceStatus: String(record.serviceStatus ?? ''),
    previousHash: String(record.previousHash ?? GENESIS_HASH),
    sequenceNumber
  });
}

/**
 * Calculate the SHA-256 hash of a repair record.
 *
 * recordHash is intentionally excluded from the payload.
 */
function computeRecordHash(record) {
  const payload = buildAuditPayload(record);

  return crypto
    .createHash('sha256')
    .update(payload, 'utf8')
    .digest('hex');
}

/**
 * Verify a chronological array of repair records.
 *
 * Records must be sorted by sequenceNumber in ascending order.
 * For the first record, previousHash must equal GENESIS_HASH.
 */
function verifyAuditChain(records) {
  if (!Array.isArray(records)) {
    throw new Error('records must be an array');
  }

  const details = [];
  let valid = true;
  let tamperedAt = null;
  let previousRecordHash = GENESIS_HASH;
  let previousSequence = 0;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    const storedHash = String(record.recordHash ?? '');
    const storedPreviousHash = String(record.previousHash ?? '');

    const sequenceNumber = Number(record.sequenceNumber);
    const expectedSequence = previousSequence + 1;

    const sequenceOk = sequenceNumber === expectedSequence;
    const prevHashOk = storedPreviousHash === previousRecordHash;

    let recomputedHash = null;
    let hashOk = false;
    let error = null;

    try {
      recomputedHash = computeRecordHash(record);
      hashOk =
        /^[a-f0-9]{64}$/i.test(storedHash) &&
        recomputedHash === storedHash;
    } catch (err) {
      error = err.message;
    }

    const ok = sequenceOk && prevHashOk && hashOk;

    if (!ok && tamperedAt === null) {
      tamperedAt = i;
      valid = false;
    }

    details.push({
      sequenceNumber: record.sequenceNumber,
      recordId: record._id ? String(record._id) : null,
      repairDate: record.repairDate,
      technicianName: record.technicianName,
      sequenceOk,
      prevHashOk,
      hashOk,
      ok,
      storedHash,
      recomputedHash,
      error
    });

    // Continue using the stored hash so a broken link remains detectable
    // in subsequent records rather than hiding the original inconsistency.
    previousRecordHash = storedHash;
    previousSequence = sequenceNumber;
  }

  return {
    valid,
    details,
    tamperedAt
  };
}

module.exports = {
  GENESIS_HASH,
  buildAuditPayload,
  computeRecordHash,
  verifyAuditChain
};
