import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export default function Baselines() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Baselines</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Create Baseline
        </Button>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Baseline list will be displayed here
      </Typography>
    </Box>
  );
}
