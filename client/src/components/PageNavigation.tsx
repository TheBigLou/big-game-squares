import { Box, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

export default function PageNavigation() {
  const navigate = useNavigate();

  return (
    <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
      <Button
        variant="outlined"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/')}
        size="large"
      >
        Home
      </Button>
    </Box>
  );
} 