import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getGame, getPendingSquares, joinGame } from '../api/client';
import { useEffect } from 'react';
import {
  Container,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import GameGrid from '../components/GameGrid';
import GameInfoBar from '../components/GameInfoBar';
import QuarterProgress from '../components/QuarterProgress';
import PlayerSelections from '../components/PlayerSelections';
import { useGameErrors } from '../hooks/useGameErrors';
import { useAuth } from '../hooks/useAuth';
import { useSquareSelection } from '../hooks/useSquareSelection';
import {
  Player,
  Square,
  GameData
} from '../types/game';
import PlayerList from '../components/PlayerList';
import VenmoCard from '../components/VenmoCard';

export default function PlayerGamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { error, setError, clearError } = useGameErrors();

  const { data, isLoading, error: fetchError, refetch } = useQuery<GameData, Error>({
    queryKey: ['game', gameId],
    queryFn: () => getGame(gameId!),
    enabled: !!gameId,
    refetchInterval: (query) => {
      if (!query.state.data) return false;
      const status = query.state.data.game.status;
      return (status === 'setup' || status === 'active') ? 1000 : false;
    },
  });

  // Update page title when game data changes
  useEffect(() => {
    if (data?.game?.name) {
      document.title = `BIG GAME SQUARES: ${data.game.name}`;
    }
    return () => {
      document.title = 'BIG GAME SQUARES';
    };
  }, [data?.game?.name]);

  const { isAuthenticated, isOwner, currentPlayer, email } = useAuth(data?.players, data?.game.ownerEmail);

  const isGameActive = data?.game.status === 'active';

  // Add query for pending squares
  const { data: pendingSquaresData } = useQuery({
    queryKey: ['pendingSquares', gameId],
    queryFn: () => getPendingSquares(gameId!),
    enabled: !!gameId && !isGameActive,
    refetchInterval: 1000, // Poll every second during setup
  });

  const {
    pendingSquares,
    handleSquareClick,
    handleConfirmSquares,
    isConfirming
  } = useSquareSelection({
    gameId: gameId!,
    currentPlayer: currentPlayer || undefined,
    email,
    squareLimit: data?.game.config.squareLimit || 0,
    squares: data?.squares || [],
    pendingSquaresData,
    onError: setError,
    onSuccess: async () => {
      await refetch();
    },
    gameStatus: data?.game.status
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">Error loading game. Please try again.</Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="warning">Game not found</Alert>
      </Box>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={`/join/${gameId}`} />;
  }

  // Redirect if user is owner
  if (isOwner) {
    return <Navigate to={`/game/${gameId}`} />;
  }

  // Redirect if not a player
  if (!currentPlayer) {
    return <Navigate to={`/join/${gameId}`} />;
  }

  const { game, players, squares } = data;

  const confirmedSquares = squares.filter((s: Square) => s.playerId === currentPlayer._id);
  const remainingPicks = game.config.squareLimit - confirmedSquares.length;

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <GameInfoBar
          name={game.name}
          gameId={game.gameId}
          squareCost={game.config.squareCost}
          prizePool={data.prizePool || 0}
          squareLimit={game.config.squareLimit}
          status={game.status}
          playerName={currentPlayer?.name}
          playerEmail={currentPlayer?.email}
          isOwner={false}
        />

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <GameGrid
              rows={game.grid?.rows || []}
              cols={game.grid?.cols || []}
              squares={squares.map((s: Square) => ({
                ...s,
                playerName: players.find((p: Player) => p._id === s.playerId)?.name || '',
                playerEmail: players.find((p: Player) => p._id === s.playerId)?.email || '',
              }))}
              pendingSquares={pendingSquares}
              onSquareClick={handleSquareClick}
              isSelectable={game.status === 'setup' && !!currentPlayer}
              gameStatus={game.status}
              teams={game.config.teams}
              currentScores={isGameActive ? game.scores?.current : undefined}
              players={players}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            {isGameActive && (
              <QuarterProgress
                scores={{
                  firstQuarter: game.scores?.firstQuarter,
                  secondQuarter: game.scores?.secondQuarter,
                  thirdQuarter: game.scores?.thirdQuarter,
                  final: game.scores?.final,
                  current: game.scores?.current || { vertical: 0, horizontal: 0 }
                }}
                config={game.config}
                squares={squares}
                players={players}
                payouts={data.payouts}
                inputValues={game.scores?.current || { vertical: 0, horizontal: 0 }}
              />
            )}

            {!isGameActive && (
              <PlayerSelections
                confirmedSquares={confirmedSquares.length}
                pendingSquares={pendingSquares.length}
                remainingPicks={remainingPicks}
                onConfirm={handleConfirmSquares}
                isConfirming={isConfirming}
              />
            )}

            <VenmoCard
              isOwner={false}
              ownerVenmoUsername={players.find(p => p.email.toLowerCase() === game.ownerEmail.toLowerCase())?.venmoUsername}
              playerVenmoUsername={currentPlayer?.venmoUsername}
              onVenmoUpdate={async (username: string) => {
                await joinGame(gameId!, {
                  email: email!,
                  name: currentPlayer.name,
                  venmoUsername: username
                });
                await refetch();
              }}
              squareCost={game.config.squareCost}
              numSquares={confirmedSquares.length}
              ownerEmail={game.ownerEmail}
              gameName={game.name}
              players={players}
              squares={squares}
            />

            <PlayerList
              players={players}
              squares={squares}
              squareCost={game.config.squareCost}
              payouts={data.payouts}
              scores={game.scores || { current: { vertical: 0, horizontal: 0 } }}
              isOwner={false}
              squareLimit={game.config.squareLimit}
              currentUserEmail={email || undefined}
              gameStatus={game.status}
              game={game}
            />
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={clearError}
        message={error}
      />
    </Container>
  );
} 