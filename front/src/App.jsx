import { useState, useEffect, useCallback } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { Save, User } from 'lucide-react';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/Editor';
import TerminalPane from './components/TerminalPane';
import PreviewPane from './components/PreviewPane';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { useWebContainer } from './hooks/useWebContainer';
import { createProject, updateProject, getUserProjects } from './api';

function App() {
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(true);
  const { webcontainer, isBooting, projectTitle, setProjectTitle } = useWebContainer();
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const [userProjects, setUserProjects] = useState([]);

  const fetchUserProjects = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUserProjects([]);
      return;
    }
    try {
      const projects = await getUserProjects();
      setUserProjects(projects);
    } catch (err) {
      console.error('Failed to fetch user projects:', err);
    }
  }, []);

  useEffect(() => {
    fetchUserProjects();
  }, [user, fetchUserProjects]);

  // File system state
  const [fileTree, setFileTree] = useState([]);
  const [activeFile, setActiveFile] = useState('/index.js');

  const refreshFileTree = useCallback(async () => {
    if (!webcontainer) return;
    
    const readDir = async (dirPath) => {
      const entries = await webcontainer.fs.readdir(dirPath, { withFileTypes: true });
      const tree = [];
      
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || (entry.name.startsWith('.') && entry.isDirectory())) continue;
        
        const fullPath = dirPath === '/' ? `/${entry.name}` : `${dirPath}/${entry.name}`;
        
        if (entry.isDirectory()) {
          const children = await readDir(fullPath);
          tree.push({ name: entry.name, path: fullPath, type: 'folder', children });
        } else {
          tree.push({ name: entry.name, path: fullPath, type: 'file' });
        }
      }
      
      return tree.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
      });
    };

    try {
      const tree = await readDir('/');
      setFileTree(tree);
    } catch (err) {
      console.error('Failed to read file tree:', err);
    }
  }, [webcontainer]);

  useEffect(() => {
    if (!webcontainer) return;

    webcontainer.on('server-ready', (port, url) => {
      setPreviewUrl(url);
    });

    refreshFileTree();

    // Debounced refresh to handle rapid terminal file writes gracefully without UI lag
    let timeoutId;
    const debouncedRefresh = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        refreshFileTree();
      }, 300);
    };

    // Watch the entire root filesystem recursively
    let watcher;
    try {
      watcher = webcontainer.fs.watch('/', { recursive: true }, (event, filename) => {
        if (filename && (filename.includes('node_modules') || filename.includes('.git'))) {
          return;
        }
        debouncedRefresh();
      });
    } catch (err) {
      console.warn('WebContainer fs.watch is not supported or failed to start:', err);
    }

    return () => {
      clearTimeout(timeoutId);
      if (watcher) {
        watcher.close();
      }
    };
  }, [webcontainer, refreshFileTree]);

  const toggleTerminal = () => {
    setIsTerminalExpanded(prev => !prev);
  };

  const exportFiles = async (dirPath = '/') => {
    const entries = await webcontainer.fs.readdir(dirPath, { withFileTypes: true });
    const result = {};
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || (entry.name.startsWith('.') && entry.isDirectory())) continue;
      const fullPath = dirPath === '/' ? `/${entry.name}` : `${dirPath}/${entry.name}`;
      if (entry.isDirectory()) {
        result[entry.name] = { directory: await exportFiles(fullPath) };
      } else {
        const contents = await webcontainer.fs.readFile(fullPath, 'utf-8');
        result[entry.name] = { file: { contents } };
      }
    }
    return result;
  };

  const handleSaveProject = async () => {
    if (!webcontainer || isSaving) return;

    // Check token directly to avoid closure stale state
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const exportedFiles = await exportFiles();
      const urlParams = new URLSearchParams(window.location.search);
      const currentId = urlParams.get('projectId');
      
      let savedProject;
      if (currentId) {
        savedProject = await updateProject(currentId, projectTitle || 'Untitled Project', exportedFiles);
      } else {
        savedProject = await createProject(projectTitle || 'Untitled Project', exportedFiles);
        window.history.replaceState({}, '', `?projectId=${savedProject._id}`);
      }
      
      alert('Project saved successfully!');
      fetchUserProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Is the backend running?');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ide-bg text-ide-text">
      {/* Sidebar - File Explorer */}
      <Sidebar 
        fileTree={fileTree} 
        activeFile={activeFile} 
        setActiveFile={setActiveFile} 
        webcontainer={webcontainer}
        refreshFileTree={refreshFileTree}
        userProjects={userProjects}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* Resizable Editor and Preview Split */}
        <div className="flex-1 flex min-h-0">
          <PanelGroup direction="horizontal">
            
            {/* Left Panel: Editor + Terminal */}
            <Panel defaultSize={50} minSize={30} className="flex flex-col min-w-0 bg-[#1e1e1e]">
              
              {/* Editor Area */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Editor Header / Tabs */}
                <div className="h-9 bg-[#252526] flex items-center px-2 border-b border-[#1e1e1e] select-none overflow-x-auto">
                  <div className="flex items-center space-x-2 bg-[#1e1e1e] px-4 py-1.5 border-t-2 border-ide-accent text-ide-text-active cursor-pointer whitespace-nowrap min-w-fit">
                    <span className="text-sm">{activeFile.split('/').pop()}</span>
                    {isBooting && <span className="ml-2 w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>}
                    <button className="text-gray-400 hover:text-white ml-2 rounded-full p-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Actual Monaco Editor */}
                <CodeEditor 
                  webcontainer={webcontainer} 
                  activeFile={activeFile} 
                />
              </div>

              {/* Terminal Area (Only under the editor) */}
              <TerminalPane 
                isExpanded={isTerminalExpanded} 
                toggleExpanded={toggleTerminal} 
                webcontainer={webcontainer}
              />
              
            </Panel>

            {/* Drag Handle */}
            <PanelResizeHandle className="w-[3px] bg-ide-border hover:bg-ide-accent active:bg-ide-accent transition-colors cursor-col-resize z-10 relative flex flex-col justify-center items-center group">
               <div className="h-8 w-1 rounded-full bg-transparent group-hover:bg-white/30 transition-colors"></div>
            </PanelResizeHandle>

            {/* Right Panel: Live Preview */}
            <Panel defaultSize={50} minSize={20} className="flex flex-col min-w-0 bg-white">
              <PreviewPane url={previewUrl} />
            </Panel>
            
          </PanelGroup>
        </div>
        
        {/* Status Bar */}
        <div className="h-6 bg-ide-accent text-white flex items-center px-3 text-xs select-none space-x-4 border-t border-blue-600 z-20">
          <div className="flex items-center space-x-1 cursor-pointer hover:bg-white/20 px-1 rounded transition-colors" onClick={handleSaveProject}>
            <Save size={14} className={isSaving ? 'animate-pulse' : ''} />
            <span>{isSaving ? 'Saving...' : 'Save Project'}</span>
          </div>
          
          <div className="flex items-center space-x-1 cursor-pointer hover:bg-white/20 px-1 rounded transition-colors">
            <span>JavaScript</span>
          </div>
          
          <div className="flex-1 text-right flex justify-end">
            <div className="flex items-center space-x-4">
              <div className="cursor-pointer hover:bg-white/20 px-1 rounded transition-colors flex items-center space-x-2">
                <span>{isBooting ? 'Booting WebContainer...' : 'Ready'}</span>
                <span>UTF-8</span>
              </div>
              
              {user && (
                <div 
                  className="cursor-pointer hover:bg-white/20 px-2 py-0.5 rounded transition-colors flex items-center space-x-1 bg-white/10"
                  onClick={logout}
                  title="Click to logout"
                >
                  <User size={12} />
                  <span>{user.email.split('@')[0]}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
      
      {/* Auth Modal overlay */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => {
          setIsAuthModalOpen(false);
          handleSaveProject(); // auto-save once logged in
        }} 
      />
    </div>
  );
}

export default App;
