import { Box, Typography, Paper } from '@mui/material';
import { getDistinctColorForId } from '../utils/colorUtils';

interface Player {
  _id: string;
  name: string;
  email: string;
  gameId: string;
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
  gameStatus
}: PlayerListProps) {
  const shouldShowEmails = gameStatus === 'active' || gameStatus === 'completed';

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Players
      </Typography>
      
      {players.map((player) => {
        const playerSquares = squares.filter((s) => s.playerId === player._id);
        const playerColor = getDistinctColorForId(player._id);
        const isCurrentUser = currentUserEmail?.toLowerCase() === player.email.toLowerCase();
        
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
                    • {player.email}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" noWrap>
                Buy-in: ${totalBuyIn.toFixed(2)} • {playerSquares.length}/{squareLimit} picks
              </Typography>
            </Box>

            {totalWinnings > 0 && (
              <Box sx={{ 
                minWidth: 120, 
                textAlign: 'right',
                flexShrink: 0
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