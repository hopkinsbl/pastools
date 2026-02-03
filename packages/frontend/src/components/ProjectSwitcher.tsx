import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Typography,
} from '@mui/material';
import { projectsApi } from '../api/projects';

export default function ProjectSwitcher() {
  const [selectedProject, setSelectedProject] = useState<string>('');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  });

  useEffect(() => {
    // Auto-select first project if available
    if (projects && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedProject(event.target.value);
    // TODO: Update global project context
    // TODO: Trigger data refresh for selected project
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary">
          Loading projects...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <FormControl fullWidth size="small">
        <InputLabel id="project-select-label">Project</InputLabel>
        <Select
          labelId="project-select-label"
          id="project-select"
          value={selectedProject}
          label="Project"
          onChange={handleChange}
        >
          {!projects || projects.length === 0 ? (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                No projects available
              </Typography>
            </MenuItem>
          ) : (
            projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
    </Box>
  );
}
