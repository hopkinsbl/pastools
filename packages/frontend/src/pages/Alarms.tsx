import { Box, Typography, Button, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import EntityList, { Column } from '../components/EntityList';
import { alarmsApi } from '../api/alarms';

// TODO: Get from project context
const DEMO_PROJECT_ID = 'demo-project';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'error';
    case 'High':
      return 'warning';
    case 'Medium':
      return 'info';
    case 'Low':
      return 'default';
    default:
      return 'default';
  }
};

const columns: Column[] = [
  { id: 'tagId', label: 'Tag ID', sortable: true },
  {
    id: 'priority',
    label: 'Priority',
    sortable: true,
    render: (value) => <Chip label={value} size="small" color={getPriorityColor(value) as any} />,
  },
  { id: 'setpoint', label: 'Setpoint' },
  { id: 'rationalization', label: 'Rationalization' },
  {
    id: 'createdAt',
    label: 'Created',
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString(),
  },
];

export default function Alarms() {
  const { data: alarms, isLoading } = useQuery({
    queryKey: ['alarms', DEMO_PROJECT_ID],
    queryFn: () => alarmsApi.getAll(DEMO_PROJECT_ID),
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Alarms</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Alarm
        </Button>
      </Box>
      <EntityList columns={columns} data={alarms || []} loading={isLoading} />
    </Box>
  );
}
