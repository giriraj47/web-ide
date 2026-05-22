import { useState, useEffect } from 'react';
import { WebContainer } from '@webcontainer/api';
import { initialFiles } from '../files.js';
import { getProjectById } from '../api.js';

let webcontainerInstance = null;

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState(null);
  const [isBooting, setIsBooting] = useState(false);
  const [error, setError] = useState(null);
  const [projectTitle, setProjectTitle] = useState(() => "untitled-" + crypto.randomUUID().slice(0, 4));

  useEffect(() => {
    async function bootContainer() {
      if (webcontainerInstance) {
        setWebcontainer(webcontainerInstance);
        return;
      }

      if (isBooting) return;

      try {
        setIsBooting(true);
        // Call only once
        webcontainerInstance = await WebContainer.boot();

        let filesToMount = initialFiles;
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('projectId');

        if (projectId) {
          try {
            const project = await getProjectById(projectId);
            if (project && project.files) {
              filesToMount = project.files;
              if (project.title) setProjectTitle(project.title);
            }
          } catch (err) {
            console.error('Failed to fetch project files:', err);
          }
        }

        // Mount initial files
        await webcontainerInstance.mount(filesToMount);

        setWebcontainer(webcontainerInstance);
      } catch (err) {
        console.error('Failed to boot WebContainer:', err);
        setError(err);
      } finally {
        setIsBooting(false);
      }
    }

    bootContainer();
  }, [isBooting]);

  return { webcontainer, isBooting, error, projectTitle, setProjectTitle };
}
