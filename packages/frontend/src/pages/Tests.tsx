import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export default function Tests() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tests</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Test
        </Button>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Test cases and scenarios will be displayed here
      </Typography>
    </Box>
  );
}
