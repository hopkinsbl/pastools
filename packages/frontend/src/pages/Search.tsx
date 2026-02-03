import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { searchApi, SearchResult } from '../api/search';

const entityTypeColors: Record<string, any> = {
  tag: 'primary',
  equipment: 'secondary',
  alarm: 'error',
  document: 'info',
  tq: 'warning',
  punchlist: 'success',
};

const entityTypeRoutes: Record<string, string> = {
  tag: '/tags',
  equipment: '/equipment',
  alarm: '/alarms',
  document: '/documents',
  tq: '/tqs',
  punchlist: '/punchlist',
};

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('');
  const navigate = useNavigate();

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', searchQuery, entityTypeFilter],
    queryFn: () => searchApi.search(searchQuery, entityTypeFilter || undefined),
    enabled: searchQuery.length >= 2,
  });

  const handleResultClick = (result: SearchResult) => {
    const route = entityTypeRoutes[result.entityType.toLowerCase()];
    if (route) {
      navigate(`${route}/${result.entityId}`);
    }
  };

  const handleEntityTypeChange = (event: SelectChangeEvent) => {
    setEntityTypeFilter(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Search
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search across all entities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          autoFocus
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Entity Type</InputLabel>
          <Select
            value={entityTypeFilter}
            label="Entity Type"
            onChange={handleEntityTypeChange}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="tag">Tags</MenuItem>
            <MenuItem value="equipment">Equipment</MenuItem>
            <MenuItem value="alarm">Alarms</MenuItem>
            <MenuItem value="document">Documents</MenuItem>
            <MenuItem value="tq">Technical Queries</MenuItem>
            <MenuItem value="punchlist">Punchlist</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {searchQuery.length < 2 ? (
        <Typography variant="body1" color="text.secondary">
          Enter at least 2 characters to search
        </Typography>
      ) : isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : results && results.length > 0 ? (
        <Paper>
          <List>
            {results.map((result, index) => (
              <ListItem key={`${result.entityType}-${result.entityId}-${index}`} disablePadding>
                <ListItemButton onClick={() => handleResultClick(result)}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={result.entityType}
                          size="small"
                          color={entityTypeColors[result.entityType.toLowerCase()] || 'default'}
                        />
                        <Typography variant="body1">{result.name}</Typography>
                      </Box>
                    }
                    secondary={result.description}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary" align="center">
            No results found for "{searchQuery}"
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
