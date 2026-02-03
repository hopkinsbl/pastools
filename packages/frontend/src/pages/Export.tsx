import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Chip,
  LinearProgress,
  Alert,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import { Download, FileDownload } from '@mui/icons-material';
import { exportApi, StartExportRequest, ExportJob } from '../api/export';

const ENTITY_TYPES = [
  { value: 'tag', label: 'Tags' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'alarm', label: 'Alarms' },
  { value: 'document', label: 'Documents' },
  { value: 'tq', label: 'Technical Queries' },
  { value: 'punchlist', label: 'Punchlist Items' },
];

const FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
];

const COLUMN_PRESETS: Record<string, string[]> = {
  tag: ['name', 'description', 'type', 'engineeringUnits', 'scaleLow', 'scaleHigh'],
  equipment: ['name', 'description', 'type', 'location'],
  alarm: ['priority', 'setpoint', 'rationalization', 'consequence', 'operatorAction'],
  document: ['title', 'type', 'version'],
  tq: ['title', 'description', 'status', 'priority', 'category'],
  punchlist: ['description', 'category', 'priority', 'status', 'closureCriteria'],
};

export default function Export() {
  const [projectId, setProjectId] = useState<string>('');
  const [entityType, setEntityType] = useState<string>('tag');
  const [format, setFormat] = useState<string>('xlsx');
  const [columns, setColumns] = useState<string[]>(COLUMN_PRESETS.tag);
  const [customColumn, setCustomColumn] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<ExportJob | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Get project ID from URL or context
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const projectIndex = pathParts.indexOf('projects');
    if (projectIndex !== -1 && pathParts[projectIndex + 1]) {
      setProjectId(pathParts[projectIndex + 1]);
    }
  }, []);

  // Poll job status
  useEffect(() => {
    if (currentJob && currentJob.status === 'Running') {
      const interval = setInterval(async () => {
        try {
          const job = await exportApi.getJobStatus(projectId, currentJob.id);
          setCurrentJob(job);

          if (job.status === 'Completed' || job.status === 'Failed') {
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
          }
        } catch (err) {
          console.error('Error polling job status:', err);
        }
      }, 2000);

      setPollingInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [currentJob, projectId]);

  const handleEntityTypeChange = (event: SelectChangeEvent) => {
    const newType = event.target.value;
    setEntityType(newType);
    setColumns(COLUMN_PRESETS[newType] || []);
  };

  const handleAddColumn = () => {
    if (customColumn && !columns.includes(customColumn)) {
      setColumns([...columns, customColumn]);
      setCustomColumn('');
    }
  };

  const handleRemoveColumn = (column: string) => {
    setColumns(columns.filter((c) => c !== column));
  };

  const handleStartExport = async () => {
    if (!projectId) {
      setError('Project ID not found');
      return;
    }

    if (columns.length === 0) {
      setError('Please select at least one column');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: StartExportRequest = {
        entityType: entityType as any,
        format: format as any,
        columns,
      };

      const response = await exportApi.startExport(projectId, request);
      
      // Start polling for job status
      const job = await exportApi.getJobStatus(projectId, response.jobId);
      setCurrentJob(job);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start export');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (currentJob && currentJob.status === 'Completed') {
      const downloadUrl = exportApi.getDownloadUrl(projectId, currentJob.id);
      window.location.href = downloadUrl;
    }
  };

  const handleReset = () => {
    setCurrentJob(null);
    setError(null);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Export Data
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        {!currentJob ? (
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={entityType}
                label="Entity Type"
                onChange={handleEntityTypeChange}
              >
                {ENTITY_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={format}
                label="Format"
                onChange={(e) => setFormat(e.target.value)}
              >
                {FORMATS.map((fmt) => (
                  <MenuItem key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Columns to Export
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {columns.map((column) => (
                  <Chip
                    key={column}
                    label={column}
                    onDelete={() => handleRemoveColumn(column)}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  label="Add Column"
                  value={customColumn}
                  onChange={(e) => setCustomColumn(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddColumn();
                    }
                  }}
                  fullWidth
                />
                <Button variant="outlined" onClick={handleAddColumn}>
                  Add
                </Button>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleStartExport}
              disabled={loading || columns.length === 0}
              fullWidth
            >
              {loading ? 'Starting Export...' : 'Start Export'}
            </Button>
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Typography variant="h6">Export Progress</Typography>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status: {currentJob.status}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={currentJob.progress}
                sx={{ mt: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {currentJob.progress}%
              </Typography>
            </Box>

            {currentJob.status === 'Completed' && currentJob.result && (
              <Alert severity="success">
                Export completed successfully! {currentJob.result.recordCount} records exported.
              </Alert>
            )}

            {currentJob.status === 'Failed' && (
              <Alert severity="error">
                Export failed: {currentJob.error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentJob.status === 'Completed' && (
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDownload}
                  fullWidth
                >
                  Download File
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={handleReset}
                fullWidth
              >
                New Export
              </Button>
            </Box>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
