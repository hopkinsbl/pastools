import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import EntityList, { Column } from '../components/EntityList';
import { equipmentApi } from '../api/equipment';

// TODO: Get from project context
const DEMO_PROJECT_ID = 'demo-project';

const columns: Column[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'type', label: 'Type', sortable: true },
  { id: 'description', label: 'Description' },
  { id: 'location', label: 'Location' },
  {
    id: 'createdAt',
    label: 'Created',
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString(),
  },
];

export default function Equipment() {
  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment', DEMO_PROJECT_ID],
    queryFn: () => equipmentApi.getAll(DEMO_PROJECT_ID),
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Equipment</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Equipment
        </Button>
      </Box>
      <EntityList columns={columns} data={equipment || []} loading={isLoading} />
    </Box>
  );
}
