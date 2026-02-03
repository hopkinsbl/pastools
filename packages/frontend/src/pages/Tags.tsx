import { Box, Typography, Button, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import EntityList, { Column } from '../components/EntityList';
import { tagsApi } from '../api/tags';

// TODO: Get from project context
const DEMO_PROJECT_ID = 'demo-project';

const columns: Column[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'type', label: 'Type', sortable: true, render: (value) => <Chip label={value} size="small" /> },
  { id: 'description', label: 'Description' },
  { id: 'engineeringUnits', label: 'Units' },
  {
    id: 'createdAt',
    label: 'Created',
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString(),
  },
];

export default function Tags() {
  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags', DEMO_PROJECT_ID],
    queryFn: () => tagsApi.getAll(DEMO_PROJECT_ID),
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tags</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Tag
        </Button>
      </Box>
      <EntityList columns={columns} data={tags || []} loading={isLoading} />
    </Box>
  );
}
