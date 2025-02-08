"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateScoringConfig = exports.generateRandomGrid = exports.generateGameId = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateGameId = () => {
    // Generate a 6-character alphanumeric game ID
    return crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
};
exports.generateGameId = generateGameId;
const generateRandomGrid = () => {
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
exports.generateRandomGrid = generateRandomGrid;
const validateScoringConfig = (scoring) => {
    const { firstQuarter, secondQuarter, thirdQuarter, final } = scoring;
    const total = firstQuarter + secondQuarter + thirdQuarter + final;
    return total === 100 &&
        Object.values(scoring).every(value => typeof value === 'number' && value >= 0);
};
exports.validateScoringConfig = validateScoringConfig;
