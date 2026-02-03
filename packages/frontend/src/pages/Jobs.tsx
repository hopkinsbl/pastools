import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  Replay as RetryIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi, Job, JobStats } from '../api/jobs';

const Jobs: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch all jobs
  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ['jobs', statusFilter],
    queryFn: () => jobsApi.getAllJobs(statusFilter || undefined),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Cancel job mutation
  const cancelMutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.cancelJob(jobId),
    onSuccess: () => {
      setSuccess('Job cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to cancel job');
    },
  });

  // Retry job mutation
  const retryMutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.retryJob(jobId),
    onSuccess: () => {
      setSuccess('Job queued for retry');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to retry job');
    },
  });

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Queued':
        return 'default';
      case 'Running':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Failed':
        return 'error';
      case 'Cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Import':
        return 'info';
      case 'Export':
        return 'secondary';
      case 'Validation':
        return 'warning';
      case 'TestRun':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDuration = (startedAt?: string, completedAt?: string) => {
    if (!startedAt) return '-';
    const start = new Date(startedAt).getTime();
    const end = completedAt ? new Date(completedAt).getTime() : Date.now();
    const durationMs = end - start;
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const canCancel = (job: Job) => {
    return job.status === 'Queued' || job.status === 'Running';
  };

  const canRetry = (job: Job) => {
    return job.status === 'Failed' || job.status === 'Cancelled';
  };

  // Calculate statistics
  const stats: JobStats = {
    total: jobs.length,
    queued: jobs.filter((j) => j.status === 'Queued').length,
    running: jobs.filter((j) => j.status === 'Running').length,
    completed: jobs.filter((j) => j.status === 'Completed').length,
    failed: jobs.filter((j) => j.status === 'Failed').length,
    cancelled: jobs.filter((j) => j.status === 'Cancelled').length,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Jobs Dashboard</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Queued
              </Typography>
              <Typography variant="h4" color="text.secondary">
                {stats.queued}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Running
              </Typography>
              <Typography variant="h4" color="primary">
                {stats.running}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Failed
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.failed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Cancelled
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.cancelled}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Queued">Queued</MenuItem>
            <MenuItem value="Running">Running</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Failed">Failed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Jobs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading jobs...
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Chip
                      label={job.type}
                      color={getTypeColor(job.type) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{job.projectName || job.projectId}</TableCell>
                  <TableCell>
                    <Chip
                      label={job.status}
                      color={getStatusColor(job.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: '100%', minWidth: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={job.progress}
                          color={
                            job.status === 'Failed'
                              ? 'error'
                              : job.status === 'Completed'
                              ? 'success'
                              : 'primary'
                          }
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {job.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {formatDuration(job.startedAt, job.completedAt)}
                  </TableCell>
                  <TableCell>{job.createdByName || job.createdBy}</TableCell>
                  <TableCell>
                    {new Date(job.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {canCancel(job) && (
                        <Tooltip title="Cancel Job">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => cancelMutation.mutate(job.id)}
                            disabled={cancelMutation.isPending}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canRetry(job) && (
                        <Tooltip title="Retry Job">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => retryMutation.mutate(job.id)}
                            disabled={retryMutation.isPending}
                          >
                            <RetryIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Error Details */}
      {jobs.some((j) => j.error) && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Failed Jobs Details
          </Typography>
          {jobs
            .filter((j) => j.error)
            .map((job) => (
              <Alert key={job.id} severity="error" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">
                  {job.type} - {job.projectName || job.projectId}
                </Typography>
                <Typography variant="body2">{job.error}</Typography>
              </Alert>
            ))}
        </Box>
      )}
    </Box>
  );
};

export default Jobs;
