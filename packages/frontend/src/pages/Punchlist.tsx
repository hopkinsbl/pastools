import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export default function Punchlist() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Punchlist</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Item
        </Button>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Punchlist items will be displayed here
      </Typography>
    </Box>
  );
}
