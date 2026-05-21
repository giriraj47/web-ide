import { Folder, File, ChevronRight, ChevronDown, FolderOpen, Plus, FolderPlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const FileExplorerItem = ({ item, depth = 0, activeFile, setActiveFile, webcontainer, refreshFileTree }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = item.type === 'folder';
  const isActive = activeFile === item.path;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      setActiveFile(item.path);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!webcontainer) return;
    try {
      await webcontainer.fs.rm(item.path, { recursive: true });
      await refreshFileTree();
      if (isActive) setActiveFile('/index.js');
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 cursor-pointer text-sm select-none group ${isActive ? 'bg-[#37373d]' : 'hover:bg-[#2a2d2e]'}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        <div className="w-4 h-4 mr-1 flex items-center justify-center opacity-80">
          {isFolder ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <span className="w-4"></span>
          )}
        </div>
        
        <div className="mr-1.5 opacity-90 text-ide-accent">
          {isFolder ? (
            isOpen ? <FolderOpen size={14} className="text-blue-400" /> : <Folder size={14} className="text-blue-400" />
          ) : (
            <File size={14} className="text-gray-400" />
          )}
        </div>
        
        <span className={`flex-1 truncate ${isFolder ? 'text-ide-text-active' : (isActive ? 'text-white' : 'text-ide-text')}`}>
          {item.name}
        </span>
        
        <button 
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded transition-all"
          onClick={handleDelete}
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
      
      {isFolder && isOpen && item.children && (
        <div>
          {item.children.map((child, idx) => (
            <FileExplorerItem 
              key={idx} 
              item={child} 
              depth={depth + 1} 
              activeFile={activeFile}
              setActiveFile={setActiveFile}
              webcontainer={webcontainer}
              refreshFileTree={refreshFileTree}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SavedProjectItem = ({ project }) => {
  const currentId = new URLSearchParams(window.location.search).get('projectId');
  const isActive = currentId === project._id;
  
  const handleLoad = () => {
    window.location.href = `?projectId=${project._id}`;
  };

  return (
    <div
      onClick={handleLoad}
      className={`flex items-center py-1.5 px-4 cursor-pointer text-sm select-none hover:bg-[#2a2d2e] transition-colors ${isActive ? 'bg-[#37373d] text-white font-medium' : 'text-ide-text'}`}
    >
      <Folder size={14} className="text-ide-accent mr-2 flex-shrink-0" />
      <span className="truncate flex-1">{project.title}</span>
    </div>
  );
};

export default function Sidebar({ fileTree, activeFile, setActiveFile, webcontainer, refreshFileTree, userProjects = [] }) {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(null); // 'file' or 'folder'
  const [newItemName, setNewItemName] = useState('');

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !webcontainer) {
      setIsCreating(null);
      setNewItemName('');
      return;
    }
    
    const path = `/${newItemName.trim()}`;
    
    try {
      if (isCreating === 'folder') {
        await webcontainer.fs.mkdir(path);
      } else {
        await webcontainer.fs.writeFile(path, '');
        setActiveFile(path);
      }
      await refreshFileTree();
    } catch (error) {
      console.error(`Failed to create ${isCreating}:`, error);
    }
    
    setIsCreating(null);
    setNewItemName('');
  };

  return (
    <div className="w-64 h-full bg-ide-panel border-r border-ide-border flex flex-col">
      <div className="px-4 py-3 border-b border-ide-border flex items-center justify-between group">
        <span className="text-xs font-semibold tracking-wider text-ide-text-active uppercase">Explorer</span>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded" 
            title="New File"
            onClick={() => setIsCreating('file')}
          >
            <Plus size={14} />
          </button>
          <button 
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded" 
            title="New Folder"
            onClick={() => setIsCreating('folder')}
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="flex items-center py-1 px-2" style={{ paddingLeft: '28px' }}>
            <div className="mr-1.5 opacity-90">
              {isCreating === 'folder' ? <Folder size={14} className="text-blue-400" /> : <File size={14} className="text-gray-400" />}
            </div>
            <input
              autoFocus
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={() => setIsCreating(null)}
              className="flex-1 bg-[#3c3c3c] text-white text-sm outline-none border border-ide-accent px-1"
              placeholder={`New ${isCreating}...`}
            />
          </form>
        )}
        
        {fileTree.map((item, idx) => (
          <FileExplorerItem 
            key={idx} 
            item={item} 
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            webcontainer={webcontainer}
            refreshFileTree={refreshFileTree}
          />
        ))}
      </div>

      {user && (
        <div className="border-t border-ide-border bg-[#18181c] flex flex-col max-h-56">
          <div className="px-4 py-2 border-b border-[#222226] flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-ide-text-active uppercase">Saved Projects</span>
            <span className="text-[10px] text-gray-500 font-mono">{userProjects.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto py-1">
            {userProjects.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-500 italic">
                No saved projects. Save this workspace to get started!
              </div>
            ) : (
              userProjects.map((project) => (
                <SavedProjectItem key={project._id} project={project} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
