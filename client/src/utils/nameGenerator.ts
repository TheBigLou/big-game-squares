const adjectives = [
  'sparkling', 'mystic', 'cosmic', 'golden', 'silver', 'crystal', 'azure', 'emerald',
  'radiant', 'vibrant', 'dancing', 'flying', 'hidden', 'silent', 'gentle', 'brave',
  'mighty', 'ancient', 'swift', 'wise'
];

const nouns = [
  'phoenix', 'dragon', 'tiger', 'eagle', 'wolf', 'bear', 'falcon', 'dolphin',
  'lion', 'panther', 'hawk', 'deer', 'fox', 'owl', 'rabbit', 'turtle',
  'horse', 'elephant', 'whale', 'penguin'
];

export function generateGameName(): string {
  const adj1 = adjectives[Math.floor(Math.random() * adjectives.length)];
  const adj2 = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adj1}-${adj2}-${noun}`;
} 