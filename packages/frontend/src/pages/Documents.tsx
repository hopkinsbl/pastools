import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import EntityList, { Column } from '../components/EntityList';
import { documentsApi } from '../api/documents';

// TODO: Get from project context
const DEMO_PROJECT_ID = 'demo-project';

const columns: Column[] = [
  { id: 'title', label: 'Title', sortable: true },
  { id: 'type', label: 'Type', sortable: true },
  { id: 'version', label: 'Version' },
  {
    id: 'createdAt',
    label: 'Created',
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString(),
  },
];

export default function Documents() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', DEMO_PROJECT_ID],
    queryFn: () => documentsApi.getAll(DEMO_PROJECT_ID),
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Documents</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Document
        </Button>
      </Box>
      <EntityList columns={columns} data={documents || []} loading={isLoading} />
    </Box>
  );
}
