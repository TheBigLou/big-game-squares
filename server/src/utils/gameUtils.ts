import crypto from 'crypto';

export const generateGameId = (): string => {
  // Generate a 6-character alphanumeric game ID
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

export const generateRandomGrid = (): { rows: number[]; cols: number[] } => {
  const numbers = Array.from({ length: 10 }, (_, i) => i);
  
  // Fisher-Yates shuffle for rows and columns
  const rows = [...numbers];
  const cols = [...numbers];
  
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  
  for (let i = cols.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cols[i], cols[j]] = [cols[j], cols[i]];
  }
  
  return { rows, cols };
};

export const validateScoringConfig = (scoring: any): boolean => {
  const { firstQuarter, secondQuarter, thirdQuarter, final } = scoring;
  const total = firstQuarter + secondQuarter + thirdQuarter + final;
  return total === 100 && 
         Object.values(scoring).every(value => typeof value === 'number' && value >= 0);
}; 