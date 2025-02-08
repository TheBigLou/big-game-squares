"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateCurrentScoreRequest = exports.validateUpdateScoreRequest = exports.validateQuarter = exports.validateScore = void 0;
const errorHandler_1 = require("../utils/errorHandler");
const validateScore = (score) => {
    if (!score || typeof score !== 'object')
        return false;
    const { vertical, horizontal } = score;
    return (typeof vertical === 'number' &&
        typeof horizontal === 'number' &&
        !isNaN(vertical) &&
        !isNaN(horizontal));
};
exports.validateScore = validateScore;
const validateQuarter = (quarter) => {
    const validQuarters = ['firstQuarter', 'secondQuarter', 'thirdQuarter', 'final'];
    return typeof quarter === 'string' && validQuarters.includes(quarter);
};
exports.validateQuarter = validateQuarter;
const validateUpdateScoreRequest = (req, _res, next) => {
    const { ownerEmail, quarter, score } = req.body;
    if (!ownerEmail || typeof ownerEmail !== 'string') {
        (0, errorHandler_1.throwBadRequest)('Owner email is required');
    }
    if (!(0, exports.validateQuarter)(quarter)) {
        (0, errorHandler_1.throwBadRequest)('Invalid quarter');
    }
    if (!(0, exports.validateScore)(score)) {
        (0, errorHandler_1.throwBadRequest)('Invalid score format');
    }
    next();
};
exports.validateUpdateScoreRequest = validateUpdateScoreRequest;
const validateUpdateCurrentScoreRequest = (req, _res, next) => {
    const { ownerEmail, score } = req.body;
    if (!ownerEmail || typeof ownerEmail !== 'string') {
        (0, errorHandler_1.throwBadRequest)('Owner email is required');
    }
    if (!(0, exports.validateScore)(score)) {
        (0, errorHandler_1.throwBadRequest)('Invalid score format');
    }
    next();
};
exports.validateUpdateCurrentScoreRequest = validateUpdateCurrentScoreRequest;
