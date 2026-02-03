import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Refresh as RefreshIcon, CompareArrows as CompareIcon } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { DuplicateCandidate, mergeApi } from '../api/merge';
import { MergeDialog } from '../components/MergeDialog';
import { tagsApi } from '../api/tags';
import { equipmentApi } from '../api/equipment';
import { alarmsApi } from '../api/alarms';
import { documentsApi } from '../api/documents';

export const Duplicates: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [entityType, setEntityType] = useState<string>('tag');
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateCandidate | null>(null);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);

  const loadDuplicates = async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all entities of the selected type
      let entities: any[] = [];
      switch (entityType) {
        case 'tag':
          entities = await tagsApi.getAll(projectId);
          break;
        case 'equipment':
          entities = await equipmentApi.getAll(projectId);
          break;
        case 'alarm':
          entities = await alarmsApi.getAll(projectId);
          break;
        case 'document':
          entities = await documentsApi.getAll(projectId);
          break;
      }

      // Detect duplicates
      const result = await mergeApi.detectDuplicates(projectId, {
        entityType,
        entities,
        matchRule: {
          entityType,
          matchFields: ['name'],
          caseSensitive: false,
          exactMatch: false,
          similarityThreshold: 0.8,
        },
      });

      setDuplicates(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to detect duplicates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDuplicates();
  }, [projectId, entityType]);

  const handleOpenMergeDialog = (duplicate: DuplicateCandidate) => {
    setSelectedDuplicate(duplicate);
    setMergeDialogOpen(true);
  };

  const handleCloseMergeDialog = () => {
    setMergeDialogOpen(false);
    setSelectedDuplicate(null);
  };

  const handleMergeComplete = () => {
    loadDuplicates();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Duplicate Detection
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadDuplicates}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Entity Type</InputLabel>
                <Select
                  value={entityType}
                  label="Entity Type"
                  onChange={(e) => setEntityType(e.target.value)}
                >
                  <MenuItem value="tag">Tags</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="alarm">Alarms</MenuItem>
                  <MenuItem value="document">Documents</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Detecting duplicates based on name similarity (80% threshold)
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : duplicates.length === 0 ? (
        <Alert severity="success">
          No duplicates found for {entityType}s in this project.
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Found {duplicates.length} Potential Duplicate{duplicates.length !== 1 ? 's' : ''}
            </Typography>
            <List>
              {duplicates.map((duplicate, index) => (
                <ListItem
                  key={index}
                  divider={index < duplicates.length - 1}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 2,
                  }}
                >
                  <Box sx={{ width: '100%', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={`${Math.round(duplicate.matchScore * 100)}% Match`}
                        color={duplicate.matchScore > 0.9 ? 'error' : 'warning'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Matched fields: {duplicate.matchedFields.join(', ')}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2} sx={{ width: '100%' }}>
                    <Grid item xs={12} md={5}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            Existing Entity
                          </Typography>
                          <ListItemText
                            primary={duplicate.existingEntity.name}
                            secondary={
                              duplicate.existingEntity.description ||
                              duplicate.existingEntity.title ||
                              'No description'
                            }
                          />
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CompareIcon color="action" />
                    </Grid>

                    <Grid item xs={12} md={5}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            New/Duplicate Entity
                          </Typography>
                          <ListItemText
                            primary={duplicate.newEntity.name}
                            secondary={
                              duplicate.newEntity.description ||
                              duplicate.newEntity.title ||
                              'No description'
                            }
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenMergeDialog(duplicate)}
                    >
                      Review & Merge
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      <MergeDialog
        open={mergeDialogOpen}
        onClose={handleCloseMergeDialog}
        duplicate={selectedDuplicate}
        projectId={projectId || ''}
        entityType={entityType}
        onMergeComplete={handleMergeComplete}
      />
    </Container>
  );
};
