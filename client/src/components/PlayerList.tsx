import { Box, Typography, Paper } from '@mui/material';
import { getDistinctColorForId } from '../utils/colorUtils';
import { togglePlayerPayment } from '../api/client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface Player {
  _id: string;
  name: string;
  email: string;
  gameId: string;
  hasPaid?: boolean;
}

interface Square {
  _id: string;
  playerId: string;
  row: number;
  col: number;
  gameId: string;
}

interface Score {
  vertical: number;
  horizontal: number;
}

interface GameScores {
  firstQuarter?: Score;
  secondQuarter?: Score;
  thirdQuarter?: Score;
  final?: Score;
  current: Score;
}

interface Payouts {
  firstQuarter: number;
  secondQuarter: number;
  thirdQuarter: number;
  final: number;
}

interface PlayerListProps {
  players: Player[];
  squares: Square[];
  squareCost: number;
  payouts: Payouts;
  scores: GameScores;
  isOwner: boolean;
  squareLimit: number;
  currentUserEmail?: string;
  gameStatus: 'setup' | 'active' | 'completed';
  game: {
    ownerEmail: string;
  };
}

export default function PlayerList({
  players,
  squares,
  squareCost,
  payouts,
  scores,
  isOwner,
  squareLimit,
  currentUserEmail,
  gameStatus,
  game
}: PlayerListProps) {
  const queryClient = useQueryClient();
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);
  const shouldShowEmails = gameStatus === 'active' || gameStatus === 'completed';

  const handleTogglePayment = async (player: Player) => {
    if (!isOwner || !currentUserEmail) return;
    setUpdatingPayment(player._id);
    try {
      const response = await togglePlayerPayment(player.gameId, player._id, currentUserEmail);
      // Update the cache with the new player data
      queryClient.setQueryData(['game', player.gameId], (oldData: any) => ({
        ...oldData,
        players: oldData.players.map((p: Player) => 
          p._id === response.player._id ? response.player : p
        )
      }));
    } catch (error) {
      console.error('Failed to toggle payment status:', error);
    } finally {
      setUpdatingPayment(null);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Players
      </Typography>
      
      {players.map((player) => {
        const playerSquares = squares.filter((s) => s.playerId === player._id);
        const playerColor = getDistinctColorForId(player._id);
        const isCurrentUser = currentUserEmail?.toLowerCase() === player.email.toLowerCase();
        const isOwnerPlayer = player.email.toLowerCase() === game?.ownerEmail?.toLowerCase();
        
        // Calculate total winnings
        const totalWinnings = payouts ? (Object.entries(payouts) as [keyof Payouts, number][]).reduce((total, [quarter, amount]) => {
          const score = scores?.[quarter];
          if (score) {
            const verticalLastDigit = score.vertical % 10;
            const horizontalLastDigit = score.horizontal % 10;
            const winningSquare = squares.find((s) => 
              s.row === verticalLastDigit && s.col === horizontalLastDigit && s.playerId === player._id
            );
            if (winningSquare) {
              return total + amount;
            }
          }
          return total;
        }, 0) : 0;
        
        const totalBuyIn = playerSquares.length * squareCost;
        const hasPaid = isOwnerPlayer || player.hasPaid;
        
        return (
          <Box key={player._id} sx={{ 
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                bgcolor: playerColor,
                flexShrink: 0
              }}
            />
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'baseline',
                gap: 1,
                flexWrap: 'wrap'
              }}>
                <Typography variant="subtitle1" component="span" noWrap>
                  {player.name}
                  {isCurrentUser && ' (You)'}
                </Typography>
                {(shouldShowEmails || isCurrentUser || isOwner) && (
                  <Typography variant="body2" color="text.secondary" component="span" noWrap>
                    {player.email}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {playerSquares.length}/{squareLimit} picks • Buy-in: ${totalBuyIn.toFixed(2)}
                </Typography>
                <Box 
                  component="span" 
                  sx={{ 
                    cursor: isOwner && !isOwnerPlayer ? 'pointer' : 'default',
                    userSelect: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    opacity: updatingPayment === player._id ? 0.5 : 1,
                    padding: '4px 12px',
                    borderRadius: 1,
                    backgroundColor: hasPaid ? 'success.main' : 'error.main',
                    color: '#fff',
                    transition: 'all 0.2s ease',
                    minWidth: '80px',
                    justifyContent: 'center',
                    ...(isOwner && !isOwnerPlayer && {
                      '&:hover': {
                        opacity: 0.8,
                        transform: 'scale(1.02)'
                      }
                    })
                  }}
                  onClick={() => !isOwnerPlayer && handleTogglePayment(player)}
                >
                  {hasPaid ? '✓ PAID' : '✗ UNPAID'}
                </Box>
              </Box>
            </Box>

            {totalWinnings > 0 && (
              <Box sx={{ 
                minWidth: 80, 
                textAlign: 'right',
                flexShrink: 0,
                ml: 1
              }}>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                  +${totalWinnings.toFixed(2)}
                </Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Paper>
  );
} 