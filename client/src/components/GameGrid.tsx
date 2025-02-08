import { Paper, Box, Typography, Tooltip } from '@mui/material';
import React, { useEffect } from 'react';
import { Player, Square, PendingSquare } from '../types/game';
import { getDistinctColorForId, resetColorCache } from '../utils/colorUtils';

interface GameGridProps {
  rows: number[];
  cols: number[];
  squares: Square[];
  pendingSquares?: PendingSquare[];
  onSquareClick?: (row: number, col: number) => void;
  players: Player[];
  isSelectable?: boolean;
  gameStatus: 'setup' | 'active' | 'completed';
  teams: {
    vertical: string;
    horizontal: string;
  };
  currentScores?: {
    vertical: number;
    horizontal: number;
  };
}

export default function GameGrid({ 
  rows, 
  cols, 
  squares,
  pendingSquares = [],
  onSquareClick, 
  players,
  gameStatus,
  teams,
  currentScores,
}: GameGridProps) {
  // Reset color cache when component mounts or when players change
  useEffect(() => {
    resetColorCache();
  }, [players.length]);

  const getSquareContent = (row: number, col: number) => {
    const square = squares.find(s => s.row === row && s.col === col);
    const isPending = pendingSquares.some(s => s.row === row && s.col === col);
    
    if (square) {
      const player = players.find(p => p._id === square.playerId);
      if (!player) return null;
      
      return (
        <Tooltip title={`${player.name} (${player.email})`} arrow>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              backgroundColor: getDistinctColorForId(player._id),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'default',
            }}
          >
            <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold' }}>
              {player.name.split(' ').map(n => n[0]).join('')}
            </Typography>
          </Box>
        </Tooltip>
      );
    }
    
    if (isPending) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: '#e0e0e0',
            opacity: 0.5,
          }}
        />
      );
    }
    
    return null;
  };

  const showNumbers = gameStatus === 'active' || gameStatus === 'completed';

  const isWinningSquare = (row: number, col: number) => {
    if (!currentScores || gameStatus !== 'active') return false;
    
    // Get last digit of each score
    const verticalLastDigit = currentScores.vertical % 10;
    const horizontalLastDigit = currentScores.horizontal % 10;
    
    return row === verticalLastDigit && col === horizontalLastDigit;
  };

  // Add useEffect to log score updates
  useEffect(() => {
    if (currentScores) {
      // Scores are handled by the component's rendering logic
    }
  }, [currentScores]);

  // Find winning square based on current scores

  return (
    <Paper sx={{ 
      p: 0.5, 
      overflow: 'auto',
      '@keyframes pulse': {
        '0%': {
          boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)'
        },
        '70%': {
          boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)'
        },
        '100%': {
          boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)'
        }
      },
      '@keyframes glow': {
        '0%': { filter: 'brightness(1)' },
        '50%': { filter: 'brightness(1.2)' },
        '100%': { filter: 'brightness(1)' }
      }
    }}>
      {/* Team name for vertical (top) team */}
      <Box sx={{ mb: 0.5, textAlign: 'center', height: 32 }}>
        <Typography variant="subtitle1" sx={{ lineHeight: 1.2, color: '#E31837' }}>
          {teams.vertical} {currentScores ? `${currentScores.horizontal}` : ''}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex' }}>
        {/* Team name for horizontal (left) team */}
        <Box sx={{ 
          width: 32, 
          mr: 0.5, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              transform: 'rotate(-90deg)',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
              color: '#004C54'
            }}
          >
            {teams.horizontal} {currentScores ? `${currentScores.vertical}` : ''}
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'auto repeat(10, 1fr)', 
          gap: 0.25, 
          flex: 1,
          minWidth: 0
        }}>
          {/* Empty top-left corner */}
          <Box sx={{ width: 32, height: 28 }} />

          {/* Column numbers */}
          {cols.map((num) => (
            <Box
              key={`col-${num}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 28,
                bgcolor: '#E31837',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: 0.5,
              }}
            >
              <Typography variant="body2">{showNumbers ? num : '-'}</Typography>
            </Box>
          ))}

          {/* Rows */}
          {rows.map((rowNum) => (
            <React.Fragment key={`row-${rowNum}`}>
              {/* Row number */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  bgcolor: '#004C54',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: 0.5,
                }}
              >
                <Typography variant="body2">{showNumbers ? rowNum : '-'}</Typography>
              </Box>

              {/* Squares for this row */}
              {cols.map((colNum) => {
                const squareContent = getSquareContent(rowNum, colNum);
                const isWinning = isWinningSquare(rowNum, colNum);

                return (
                  <Box
                    key={`${rowNum}-${colNum}`}
                    onClick={() => onSquareClick?.(rowNum, colNum)}
                    sx={{
                      aspectRatio: '1.4',
                      border: isWinning ? 2 : 1,
                      borderColor: isWinning ? 'success.main' : 'grey.300',
                      borderRadius: 0.5,
                      bgcolor: isWinning ? 'success.light' : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: isWinning ? 'success.light' : 'action.hover',
                        filter: isWinning ? 'brightness(1.1)' : undefined,
                      },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 0,
                      position: 'relative',
                      ...(isWinning && {
                        animation: 'pulse 2s infinite, glow 2s infinite',
                        boxShadow: (theme) => `0 0 15px ${theme.palette.success.main}`,
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          left: -2,
                          right: -2,
                          bottom: -2,
                          borderRadius: 'inherit',
                          border: '2px solid',
                          borderColor: 'success.light',
                          opacity: 0.5,
                          animation: 'pulse 2s infinite',
                        }
                      }),
                    }}
                  >
                    {squareContent}
                  </Box>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Box>
    </Paper>
  );
} 