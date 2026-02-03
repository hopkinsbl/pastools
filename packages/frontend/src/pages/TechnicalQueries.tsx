import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export default function TechnicalQueries() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Technical Queries</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New TQ
        </Button>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Technical query list will be displayed here
      </Typography>
    </Box>
  );
}
