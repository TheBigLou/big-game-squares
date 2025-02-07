import { Box, Typography, Grid, Chip, Paper, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useState, useEffect } from 'react';

interface Player {
  _id: string;
  name: string;
  email: string;
  gameId: string;
}

interface Square {
  _id: string;
  gameId: string;
  playerId: string;
  row: number;
  col: number;
}

interface Score {
  vertical: number;
  horizontal: number;
}

interface Payouts {
  firstQuarter: number;
  secondQuarter: number;
  thirdQuarter: number;
  final: number;
}

interface QuarterProgressProps {
  scores?: {
    firstQuarter?: Score;
    secondQuarter?: Score;
    thirdQuarter?: Score;
    final?: Score;
    current: Score;
  };
  config: {
    teams: {
      vertical: string;
      horizontal: string;
    };
    scoring: {
      firstQuarter: number;
      secondQuarter: number;
      thirdQuarter: number;
      final: number;
    };
  };
  squares: Square[];
  players: Player[];
  payouts: Payouts;
  isOwner?: boolean;
  onSaveQuarter?: (quarter: keyof Payouts, score: Score) => void;
  onScoreChange?: (team: 'vertical' | 'horizontal', value: string) => void;
  onCurrentScoreSubmit?: () => void;
  inputValues: Score;
  isSaving?: boolean;
}

export default function QuarterProgress({ 
  scores, 
  config, 
  squares, 
  players, 
  payouts,
  isOwner = false,
  onSaveQuarter,
  onScoreChange,
  onCurrentScoreSubmit,
  inputValues,
  isSaving = false
}: QuarterProgressProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [quarterToEnd, setQuarterToEnd] = useState<keyof Payouts | null>(null);

  const quarters: { label: string; value: keyof Payouts; winningAmount: number; buttonText: string }[] = [
    { label: 'First Quarter', value: 'firstQuarter', winningAmount: config.scoring.firstQuarter, buttonText: 'END QUARTER' },
    { label: 'Second Quarter', value: 'secondQuarter', winningAmount: config.scoring.secondQuarter, buttonText: 'END HALF' },
    { label: 'Third Quarter', value: 'thirdQuarter', winningAmount: config.scoring.thirdQuarter, buttonText: 'END QUARTER' },
    { label: 'Final', value: 'final', winningAmount: config.scoring.final, buttonText: 'END GAME' },
  ];

  // Find the current active quarter
  const activeQuarterIndex = quarters.findIndex(q => !scores?.[q.value]);

  // State to track which quarter is being viewed
  const [viewingQuarterIndex, setViewingQuarterIndex] = useState(activeQuarterIndex);

  // Update viewing quarter when active quarter changes
  useEffect(() => {
    setViewingQuarterIndex(activeQuarterIndex);
  }, [activeQuarterIndex]);

  // Navigation functions
  const goToPreviousQuarter = () => {
    if (viewingQuarterIndex > 0) {
      setViewingQuarterIndex(viewingQuarterIndex - 1);
    }
  };

  const goToNextQuarter = () => {
    if (viewingQuarterIndex < activeQuarterIndex) {
      setViewingQuarterIndex(viewingQuarterIndex + 1);
    }
  };

  const quarter = quarters[viewingQuarterIndex];
  if (!quarter) return null;

  const score = scores?.[quarter.value];
  const isCompleted = !!score;
  const isActive = viewingQuarterIndex === activeQuarterIndex;
  
  // Find winning player if score exists or if it's the active quarter
  let winningPlayer: Player | undefined;
  const scoreToUse = isActive ? scores?.current : score;
  if (scoreToUse) {
    const verticalLastDigit = scoreToUse.vertical % 10;
    const horizontalLastDigit = scoreToUse.horizontal % 10;
    const winningSquare = squares.find((s: Square) => 
      s.row === verticalLastDigit && s.col === horizontalLastDigit
    );
    if (winningSquare) {
      winningPlayer = players.find((p: Player) => p._id === winningSquare.playerId);
    }
  }

  const quarterStatus = isCompleted ? 'COMPLETE' 
    : isActive ? 'PLAYING'
    : 'PENDING';

  return (
    <Paper sx={{ p: 1.5, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <IconButton 
          onClick={goToPreviousQuarter} 
          disabled={viewingQuarterIndex === 0}
          size="small"
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {quarter.label}
          </Typography>
          <Typography 
            variant="body2" 
            color={isCompleted ? 'success.main' : 'text.secondary'}
            sx={isActive ? { fontStyle: 'italic' } : undefined}
          >
            {winningPlayer 
              ? `${winningPlayer.name}: $${payouts?.[quarter.value]?.toFixed(2) || '0.00'}${isCompleted ? ' ✓' : ''}`
              : 'No winner yet'
            }
          </Typography>
        </Box>
        <IconButton 
          onClick={goToNextQuarter} 
          disabled={viewingQuarterIndex >= activeQuarterIndex}
          size="small"
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>

      {/* Score Display/Input */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item xs={6}>
          {isActive && isOwner ? (
            <TextField
              fullWidth
              type="number"
              inputProps={{
                min: 0,
                max: 99,
                style: { WebkitAppearance: 'none', margin: 0 }
              }}
              label={`${config.teams.horizontal} Score`}
              value={inputValues.vertical}
              onChange={(e) => onScoreChange?.('vertical', e.target.value)}
              size="small"
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {config.teams.horizontal}: {score?.vertical || scores?.current.vertical || '0'}
            </Typography>
          )}
        </Grid>
        <Grid item xs={6}>
          {isActive && isOwner ? (
            <TextField
              fullWidth
              type="number"
              inputProps={{
                min: 0,
                max: 99,
                style: { WebkitAppearance: 'none', margin: 0 }
              }}
              label={`${config.teams.vertical} Score`}
              value={inputValues.horizontal}
              onChange={(e) => onScoreChange?.('horizontal', e.target.value)}
              size="small"
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {config.teams.vertical}: {score?.horizontal || scores?.current.horizontal || '0'}
            </Typography>
          )}
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        {isActive && isOwner && (
          <Button
            variant="contained"
            color="primary"
            onClick={onCurrentScoreSubmit}
            disabled={isSaving}
            fullWidth
          >
            {isSaving ? 'Updating...' : 'Update Current Score'}
          </Button>
        )}
        {isActive && isOwner && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setQuarterToEnd(quarter.value);
              setConfirmDialogOpen(true);
            }}
            disabled={isSaving}
            fullWidth
          >
            {quarter.buttonText}
          </Button>
        )}
      </Box>
      
      <Box sx={{ mt: 1 }}>
        <Chip 
          label={quarterStatus} 
          color={isCompleted ? 'success' : isActive ? 'primary' : 'default'}
          size="small"
          sx={{ width: '100%' }}
        />
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm End {quarterToEnd === 'final' ? 'Game' : 'Quarter'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please confirm the current score is correct:
          </Typography>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle1" color="primary">
              {config.teams.horizontal}: {inputValues.vertical}
            </Typography>
            <Typography variant="subtitle1" color="primary">
              {config.teams.vertical}: {inputValues.horizontal}
            </Typography>
          </Box>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Warning: This action cannot be undone. The {quarterToEnd === 'final' ? 'game' : 'quarter'} score will be final.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (quarterToEnd && onSaveQuarter) {
                onSaveQuarter(quarterToEnd, inputValues);
                setConfirmDialogOpen(false);
                setQuarterToEnd(null);
              }
            }}
            variant="contained"
            color="primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : `Confirm ${quarterToEnd === 'final' ? 'End Game' : 'End Quarter'}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 