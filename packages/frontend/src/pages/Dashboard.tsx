import { Box, Typography, Grid, Paper } from '@mui/material';

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome to PAStools Platform
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tags
            </Typography>
            <Typography variant="h3">0</Typography>
            <Typography variant="body2" color="text.secondary">
              Total tags in project
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Equipment
            </Typography>
            <Typography variant="h3">0</Typography>
            <Typography variant="body2" color="text.secondary">
              Total equipment items
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Alarms
            </Typography>
            <Typography variant="h3">0</Typography>
            <Typography variant="body2" color="text.secondary">
              Total alarms
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Documents
            </Typography>
            <Typography variant="h3">0</Typography>
            <Typography variant="body2" color="text.secondary">
              Total documents
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
