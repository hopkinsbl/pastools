import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  DuplicateCandidate,
  MergeStrategy,
  MergeRequest,
  mergeApi,
} from '../api/merge';

interface MergeDialogProps {
  open: boolean;
  onClose: () => void;
  duplicate: DuplicateCandidate | null;
  projectId: string;
  entityType: string;
  onMergeComplete: () => void;
}

export const MergeDialog: React.FC<MergeDialogProps> = ({
  open,
  onClose,
  duplicate,
  projectId,
  entityType,
  onMergeComplete,
}) => {
  const [strategy, setStrategy] = useState<MergeStrategy>(MergeStrategy.MERGE_FIELDS);
  const [fieldSelections, setFieldSelections] = useState<Record<string, 'source' | 'target'>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!duplicate) return null;

  const { existingEntity, newEntity, matchScore, matchedFields } = duplicate;

  // Get all fields from both entities
  const allFields = Array.from(
    new Set([
      ...Object.keys(existingEntity || {}),
      ...Object.keys(newEntity || {}),
    ])
  ).filter(
    (field) =>
      !['id', 'createdAt', 'updatedAt', 'createdBy', 'projectId'].includes(field)
  );

  const handleFieldSelection = (field: string, selection: 'source' | 'target') => {
    setFieldSelections((prev) => ({
      ...prev,
      [field]: selection,
    }));
  };

  const handleMerge = async () => {
    if (!existingEntity?.id) {
      setError('Existing entity ID not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: MergeRequest = {
        entityType,
        sourceEntityId: newEntity.id || 'temp-id', // For new entities, we'd need to create them first
        targetEntityId: existingEntity.id,
        strategy,
        fieldSelections: strategy === MergeStrategy.MERGE_FIELDS ? fieldSelections : undefined,
      };

      const result = await mergeApi.mergeEntities(projectId, request);

      if (result.success) {
        onMergeComplete();
        onClose();
      } else {
        setError(result.error || 'Merge failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to merge entities');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Merge Duplicate Entities
        <Chip
          label={`${Math.round(matchScore * 100)}% Match`}
          color={matchScore > 0.9 ? 'error' : 'warning'}
          size="small"
          sx={{ ml: 2 }}
        />
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Matched fields: {matchedFields.join(', ')}
          </Typography>
        </Box>

        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Merge Strategy</FormLabel>
          <RadioGroup
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as MergeStrategy)}
          >
            <FormControlLabel
              value={MergeStrategy.SKIP}
              control={<Radio />}
              label="Skip - Keep existing entity, discard new one"
            />
            <FormControlLabel
              value={MergeStrategy.OVERWRITE}
              control={<Radio />}
              label="Overwrite - Replace existing with new entity"
            />
            <FormControlLabel
              value={MergeStrategy.MERGE_FIELDS}
              control={<Radio />}
              label="Merge Fields - Choose fields from each entity"
            />
          </RadioGroup>
        </FormControl>

        {strategy === MergeStrategy.MERGE_FIELDS && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Field Comparison
            </Typography>
            <Grid container spacing={2}>
              {allFields.map((field) => {
                const existingValue = existingEntity[field];
                const newValue = newEntity[field];
                const isDifferent = existingValue !== newValue;

                return (
                  <Grid item xs={12} key={field}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {field}
                          {matchedFields.includes(field) && (
                            <Chip
                              label="Matched"
                              size="small"
                              color="success"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <FormControlLabel
                              control={
                                <Radio
                                  checked={fieldSelections[field] === 'target'}
                                  onChange={() => handleFieldSelection(field, 'target')}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Existing
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: isDifferent ? 'bold' : 'normal',
                                      color: isDifferent ? 'primary.main' : 'text.primary',
                                    }}
                                  >
                                    {existingValue !== null && existingValue !== undefined
                                      ? String(existingValue)
                                      : '(empty)'}
                                  </Typography>
                                </Box>
                              }
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <FormControlLabel
                              control={
                                <Radio
                                  checked={fieldSelections[field] === 'source'}
                                  onChange={() => handleFieldSelection(field, 'source')}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    New
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: isDifferent ? 'bold' : 'normal',
                                      color: isDifferent ? 'secondary.main' : 'text.primary',
                                    }}
                                  >
                                    {newValue !== null && newValue !== undefined
                                      ? String(newValue)
                                      : '(empty)'}
                                  </Typography>
                                </Box>
                              }
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleSkip} disabled={loading}>
          Skip
        </Button>
        <Button
          onClick={handleMerge}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Merging...' : 'Merge'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
