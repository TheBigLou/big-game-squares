// Generate a deterministic color based on a string (player ID)
export const getColorForId = (id: string) => {
  // Use a more sophisticated hash function for better distribution
  const hash = id.split('').reduce((acc, char, i) => {
    const charCode = char.charCodeAt(0);
    return ((acc << 5) - acc + (charCode * (i + 1))) >>> 0;
  }, 0);

  // Use golden ratio conjugate for better distribution
  const goldenRatioConjugate = 0.618033988749895;
  
  // Generate a hue value between 0 and 1
  let hue = hash * goldenRatioConjugate;
  // Only keep the fractional part
  hue = hue - Math.floor(hue);
  
  // Convert to degrees (0-360)
  hue = Math.floor(hue * 360);
  
  // Use fixed saturation and lightness ranges for better visibility
  // Avoid too light or too dark colors
  const saturation = 65 + (hash % 15); // Range: 65-80%
  const lightness = 55 + (hash % 10);  // Range: 55-65%

  // Adjust hue to avoid too similar colors
  // This spreads out the colors more evenly
  const adjustedHue = (hue + (hash % 30) - 15) % 360;

  return `hsl(${adjustedHue}, ${saturation}%, ${lightness}%)`;
};

// Pre-defined color palette for small numbers of players
const distinctColors = [
  'hsl(200, 70%, 60%)',  // Blue
  'hsl(0, 70%, 60%)',    // Red
  'hsl(120, 70%, 60%)',  // Green
  'hsl(280, 70%, 60%)',  // Purple
  'hsl(30, 70%, 60%)',   // Orange
  'hsl(180, 70%, 60%)',  // Cyan
  'hsl(300, 70%, 60%)',  // Pink
  'hsl(60, 70%, 60%)',   // Yellow
  'hsl(150, 70%, 60%)',  // Spring Green
  'hsl(330, 70%, 60%)',  // Rose
];

// Cache to store already used colors
const usedColors = new Set<string>();

export const getDistinctColorForId = (id: string) => {
  // If we have a pre-defined color available and haven't used many colors yet,
  // use it for better distinction
  if (usedColors.size < distinctColors.length) {
    const color = distinctColors[usedColors.size];
    usedColors.add(color);
    return color;
  }

  // Fall back to algorithmic color generation for larger numbers of players
  let color = getColorForId(id);
  let attempts = 0;

  // Try to find a color that's not too similar to existing ones
  while (attempts < 10 && isColorTooSimilar(color)) {
    color = getColorForId(id + attempts);
    attempts++;
  }

  usedColors.add(color);
  return color;
};

// Helper function to check if a color is too similar to existing ones
function isColorTooSimilar(newColor: string): boolean {
  const newHue = extractHue(newColor);
  
  for (const existingColor of usedColors) {
    const existingHue = extractHue(existingColor);
    const hueDifference = Math.abs(newHue - existingHue);
    const wrappedHueDifference = Math.min(hueDifference, 360 - hueDifference);
    
    if (wrappedHueDifference < 30) {
      return true;
    }
  }
  
  return false;
}

// Helper function to extract hue from HSL color string
function extractHue(color: string): number {
  const match = color.match(/hsl\((\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Reset the color cache (useful when starting a new game)
export const resetColorCache = () => {
  usedColors.clear();
}; 