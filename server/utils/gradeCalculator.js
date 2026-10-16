/**
 * Grade Calculator according to business rules:
 * A+ >= 90
 * A  >= 80
 * B  >= 70
 * C  >= 60
 * D  >= 50
 * F  <  50
 */
export const calculateGrade = (percentage) => {
  const pct = Number(percentage);
  if (isNaN(pct) || pct < 0) return { grade: 'F', points: 0.0, status: 'Fail' };
  if (pct >= 90) return { grade: 'A+', points: 4.0, status: 'Pass' };
  if (pct >= 80) return { grade: 'A', points: 3.7, status: 'Pass' };
  if (pct >= 70) return { grade: 'B', points: 3.0, status: 'Pass' };
  if (pct >= 60) return { grade: 'C', points: 2.0, status: 'Pass' };
  if (pct >= 50) return { grade: 'D', points: 1.0, status: 'Pass' };
  return { grade: 'F', points: 0.0, status: 'Fail' };
};
