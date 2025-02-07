import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/HomePage';
import CreateGamePage from './pages/CreateGamePage';
import GamePage from './pages/GamePage';
import JoinGamePage from './pages/JoinGamePage';
import PlayerGamePage from './pages/PlayerGamePage';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateGamePage />} />
            <Route path="/game/:gameId" element={<GamePage />} />
            <Route path="/join/:gameId" element={<JoinGamePage />} />
            <Route path="/play/:gameId" element={<PlayerGamePage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
