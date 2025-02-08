"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameController = __importStar(require("../controllers/gameController"));
const playerController = __importStar(require("../controllers/playerController"));
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Game routes
router.post('/games', gameController.createGame);
router.get('/games/:gameId', gameController.getGame);
router.post('/games/:gameId/start', gameController.startGame);
router.post('/games/:gameId/score', validation_1.validateUpdateScoreRequest, gameController.updateGameScore);
router.post('/games/:gameId/current-score', validation_1.validateUpdateCurrentScoreRequest, gameController.updateCurrentScore);
router.post('/games/:gameId/pending-squares', gameController.updatePendingSquares);
router.get('/games/:gameId/pending-squares', gameController.getPendingSquares);
// Player routes
router.post('/games/:gameId/join', playerController.joinGame);
router.post('/games/:gameId/squares', playerController.selectSquare);
router.get('/games/:gameId/squares', playerController.getPlayerSquares);
exports.default = router;
