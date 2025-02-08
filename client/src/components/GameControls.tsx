import { Box, Button, Typography, LinearProgress } from '@mui/material';
import { useState } from 'react';
import PaymentRequestModal from './PaymentRequestModal';

interface GameControlsProps {
  gameId: string;
  isGameActive: boolean;
  onStartGame: () => void;
  isStarting: boolean;
  totalSquares: number;
  filledSquares: number;
  players: any[];
  squares: any[];
  squareCost: number;
  ownerEmail: string;
  gameName: string;
  onVenmoUpdate: (playerId: string, username: string) => Promise<void>;
}

export default function GameControls({
  gameId,
  isGameActive,
  onStartGame,
  isStarting,
  totalSquares,
  filledSquares,
  players,
  squares,
  squareCost,
  ownerEmail,
  gameName,
  onVenmoUpdate
}: GameControlsProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const progress = (filledSquares / totalSquares) * 100;

  const handleStartGame = () => {
    setShowPaymentModal(true);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Grid Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filledSquares}/{totalSquares} squares
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 8,
            borderRadius: 1
          }}
        />
      </Box>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleStartGame}
        disabled={isStarting}
      >
        {isStarting ? 'Starting Game...' : 'Start Game'}
      </Button>

      <PaymentRequestModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onStartGame={() => {
          setShowPaymentModal(false);
          onStartGame();
        }}
        players={players}
        squares={squares}
        squareCost={squareCost}
        ownerEmail={ownerEmail}
        gameName={gameName}
        onVenmoUpdate={onVenmoUpdate}
      />
    </Box>
  );
} 