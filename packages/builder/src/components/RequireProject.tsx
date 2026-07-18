import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../state/ProjectContext';
import { EmptyState } from './ui';
import type { Project } from '@forgelink/shared';

/**
 * Guard for pages that operate on the active project. Renders the child render-
 * prop with a guaranteed non-null project, or an empty state prompting the user
 * to pick one.
 */
export function RequireProject({
  children,
}: {
  children: (project: Project) => React.ReactNode;
}): JSX.Element {
  const { activeProject } = useProjects();
  const navigate = useNavigate();

  if (!activeProject) {
    return (
      <EmptyState
        title="No project selected"
        description="Select or create a project to configure it."
        action={
          <button className="btn-primary" onClick={() => navigate('/projects')}>
            Go to Projects
          </button>
        }
      />
    );
  }
  return <>{children(activeProject)}</>;
}
