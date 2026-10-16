/**
 * Unique ID Generator
 * Student: STU-YYYY-XXXX (e.g. STU-2026-0001)
 * Teacher: TCH-YYYY-XXXX (e.g. TCH-2026-0001)
 * Fee Receipt: REC-YYYY-XXXX (e.g. REC-2026-0001)
 */
export const generateId = async (model, fieldName, prefix) => {
  const currentYear = new Date().getFullYear();
  const pattern = new RegExp(`^${prefix}-${currentYear}-(\\d{4})$`);

  // Find the latest document with this prefix and year
  const latestDoc = await model
    .findOne({ [fieldName]: { $regex: pattern } })
    .sort({ [fieldName]: -1 })
    .lean();

  let nextSequence = 1;
  if (latestDoc && latestDoc[fieldName]) {
    const match = latestDoc[fieldName].match(pattern);
    if (match && match[1]) {
      nextSequence = parseInt(match[1], 10) + 1;
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, '0');
  return `${prefix}-${currentYear}-${paddedSequence}`;
};
