import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  IconButton,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  PlayArrow as StartIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { importApi, FileInfo, SheetInfo, Job, ImportReport } from '../api/import';

const steps = ['Upload File', 'Map Columns', 'Review & Import', 'Import Results'];

const entityTypes = [
  { value: 'tag', label: 'Tags' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'alarm', label: 'Alarms' },
  { value: 'document', label: 'Documents' },
];

// Common field mappings for each entity type
const entityFieldOptions: Record<string, { value: string; label: string }[]> = {
  tag: [
    { value: 'name', label: 'Tag Name' },
    { value: 'description', label: 'Description' },
    { value: 'type', label: 'Type' },
    { value: 'engineeringUnits', label: 'Engineering Units' },
    { value: 'scaleLow', label: 'Scale Low' },
    { value: 'scaleHigh', label: 'Scale High' },
  ],
  equipment: [
    { value: 'name', label: 'Equipment Name' },
    { value: 'description', label: 'Description' },
    { value: 'type', label: 'Type' },
    { value: 'location', label: 'Location' },
  ],
  alarm: [
    { value: 'priority', label: 'Priority' },
    { value: 'setpoint', label: 'Setpoint' },
    { value: 'rationalization', label: 'Rationalization' },
    { value: 'consequence', label: 'Consequence' },
    { value: 'operatorAction', label: 'Operator Action' },
  ],
  document: [
    { value: 'title', label: 'Title' },
    { value: 'type', label: 'Type' },
    { value: 'version', label: 'Version' },
  ],
};

export default function Import() {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>('');
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [entityType, setEntityType] = useState<string>('tag');
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [profileName, setProfileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Import execution state
  const [importJob, setImportJob] = useState<Job | null>(null);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Get project ID from URL or context (for now, using a placeholder)
  const projectId = '123e4567-e89b-12d3-a456-426614174000'; // TODO: Get from context

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const info = await importApi.parseFile(selectedFile);
      setFileInfo(info);
      
      // Store file path (in real implementation, this would come from the upload response)
      setFilePath(`/uploads/${selectedFile.name}`);
      
      if (info.sheets.length > 0) {
        setSelectedSheet(info.sheets[0].name);
      }
      setActiveStep(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSheet = (): SheetInfo | null => {
    if (!fileInfo || !selectedSheet) return null;
    return fileInfo.sheets.find((sheet) => sheet.name === selectedSheet) || null;
  };

  const handleColumnMappingChange = (fileColumn: string, entityField: string) => {
    setColumnMappings((prev) => ({
      ...prev,
      [fileColumn]: entityField,
    }));
  };

  const handleRemoveMapping = (fileColumn: string) => {
    setColumnMappings((prev) => {
      const newMappings = { ...prev };
      delete newMappings[fileColumn];
      return newMappings;
    });
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      setError('Please enter a profile name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await importApi.createProfile({
        name: profileName,
        entityType,
        columnMappings,
      });
      setSuccess('Import profile saved successfully');
      setProfileName('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 1 && Object.keys(columnMappings).length === 0) {
      setError('Please map at least one column');
      return;
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setFilePath('');
    setFileInfo(null);
    setSelectedSheet('');
    setColumnMappings({});
    setProfileName('');
    setError(null);
    setSuccess(null);
    setImportJob(null);
    setImportReport(null);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const handleStartImport = async () => {
    if (!fileInfo || !file) {
      setError('No file selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const job = await importApi.startImport(projectId, {
        filePath,
        fileType: fileInfo.fileType as 'csv' | 'xlsx',
        sheetName: selectedSheet,
        entityType,
        columnMappings,
      });

      setImportJob(job);
      setActiveStep(3);

      // Start polling for job status
      const interval = setInterval(async () => {
        try {
          const updatedJob = await importApi.getJob(job.id);
          setImportJob(updatedJob);

          if (updatedJob.status === 'Completed' || updatedJob.status === 'Failed') {
            clearInterval(interval);
            setPollingInterval(null);

            // Fetch the import report
            if (updatedJob.status === 'Completed') {
              const report = await importApi.getImportReport(updatedJob.id);
              setImportReport(report);
            }
          }
        } catch (err) {
          console.error('Error polling job status:', err);
        }
      }, 2000); // Poll every 2 seconds

      setPollingInterval(interval);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start import');
    } finally {
      setLoading(false);
    }
  };

  const currentSheet = getCurrentSheet();
  const fieldOptions = entityFieldOptions[entityType] || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Import Data
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Step 1: Upload File */}
      {activeStep === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Upload CSV or Excel File
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select a CSV or XLSX file to import. Maximum file size: 100MB
            </Typography>

            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
              disabled={loading}
            >
              Choose File
              <input
                type="file"
                hidden
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
              />
            </Button>

            {file && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            )}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Map Columns */}
      {activeStep === 1 && fileInfo && currentSheet && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Map Columns to Fields
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Entity Type</InputLabel>
                  <Select
                    value={entityType}
                    label="Entity Type"
                    onChange={(e) => {
                      setEntityType(e.target.value);
                      setColumnMappings({});
                    }}
                  >
                    {entityTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {fileInfo.sheets.length > 1 && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sheet</InputLabel>
                    <Select
                      value={selectedSheet}
                      label="Sheet"
                      onChange={(e) => setSelectedSheet(e.target.value)}
                    >
                      {fileInfo.sheets.map((sheet) => (
                        <MenuItem key={sheet.name} value={sheet.name}>
                          {sheet.name} ({sheet.rowCount} rows)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Map columns from your file to entity fields. Unmapped columns will be ignored.
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File Column</TableCell>
                    <TableCell>Maps To</TableCell>
                    <TableCell width={100}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentSheet.headers.map((header) => (
                    <TableRow key={header}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {header}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={columnMappings[header] || ''}
                            onChange={(e) =>
                              handleColumnMappingChange(header, e.target.value)
                            }
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>Not mapped</em>
                            </MenuItem>
                            {fieldOptions.map((field) => (
                              <MenuItem key={field.value} value={field.value}>
                                {field.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {columnMappings[header] && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveMapping(header)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Save Mapping Profile (Optional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Profile name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  disabled={
                    loading ||
                    !profileName.trim() ||
                    Object.keys(columnMappings).length === 0
                  }
                >
                  Save Profile
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={Object.keys(columnMappings).length === 0}
              >
                Next
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Import */}
      {activeStep === 2 && fileInfo && currentSheet && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Review Import Configuration
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  File
                </Typography>
                <Typography variant="body1">{file?.name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Sheet
                </Typography>
                <Typography variant="body1">
                  {selectedSheet} ({currentSheet.rowCount} rows)
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Entity Type
                </Typography>
                <Typography variant="body1">
                  {entityTypes.find((t) => t.value === entityType)?.label}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Mapped Columns
                </Typography>
                <Typography variant="body1">
                  {Object.keys(columnMappings).length}
                </Typography>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" gutterBottom>
              Column Mappings
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>File Column</TableCell>
                    <TableCell>Entity Field</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(columnMappings).map(([fileCol, entityField]) => (
                    <TableRow key={fileCol}>
                      <TableCell>{fileCol}</TableCell>
                      <TableCell>
                        {fieldOptions.find((f) => f.value === entityField)?.label}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={handleReset}>Start Over</Button>
                <Button
                  variant="contained"
                  startIcon={<StartIcon />}
                  onClick={handleStartImport}
                  disabled={loading}
                >
                  Start Import
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Import Results */}
      {activeStep === 3 && importJob && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Import Progress
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="body2">Status:</Typography>
                <Chip
                  label={importJob.status}
                  color={
                    importJob.status === 'Completed'
                      ? 'success'
                      : importJob.status === 'Failed'
                      ? 'error'
                      : importJob.status === 'Running'
                      ? 'primary'
                      : 'default'
                  }
                  size="small"
                />
              </Box>

              {importJob.status === 'Running' && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <LinearProgress variant="determinate" value={importJob.progress} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {importJob.progress}% complete
                  </Typography>
                </Box>
              )}

              {importJob.status === 'Failed' && importJob.error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {importJob.error}
                </Alert>
              )}
            </Box>

            {importReport && (
              <>
                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Import Report
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SuccessIcon color="success" />
                          <Box>
                            <Typography variant="h4">{importReport.success}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Successful
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ErrorIcon color="error" />
                          <Box>
                            <Typography variant="h4">{importReport.errors}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Errors
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningIcon color="warning" />
                          <Box>
                            <Typography variant="h4">{importReport.warnings}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Warnings
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box>
                          <Typography variant="h4">{importReport.totalRows}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Rows
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {importReport.errorDetails.length > 0 && (
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Error Details ({importReport.errorDetails.length} rows)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Row</TableCell>
                              <TableCell>Error</TableCell>
                              <TableCell>Data</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {importReport.errorDetails.map((detail, index) => (
                              <TableRow key={index}>
                                <TableCell>{detail.row}</TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="error">
                                    {detail.error}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontFamily: 'monospace',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    {JSON.stringify(detail.data)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                )}

                {importReport.warningDetails.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Warning Details ({importReport.warningDetails.length} rows)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Row</TableCell>
                              <TableCell>Warnings</TableCell>
                              <TableCell>Entity ID</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {importReport.warningDetails.map((detail, index) => (
                              <TableRow key={index}>
                                <TableCell>{detail.row}</TableCell>
                                <TableCell>
                                  {detail.warnings.map((warning, wIndex) => (
                                    <Typography
                                      key={wIndex}
                                      variant="body2"
                                      color="warning.main"
                                    >
                                      • {warning}
                                    </Typography>
                                  ))}
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                  >
                                    {detail.entityId || 'N/A'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                )}
              </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" onClick={handleReset}>
                Import Another File
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
