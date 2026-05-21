import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';

export default function CodeEditor({ webcontainer, activeFile }) {
  const [code, setCode] = useState('');

  // Load file content when activeFile changes
  useEffect(() => {
    async function loadFile() {
      if (webcontainer && activeFile) {
        try {
          const content = await webcontainer.fs.readFile(activeFile, 'utf-8');
          setCode(content);
        } catch (error) {
          console.error(`Failed to read file ${activeFile}:`, error);
          setCode('');
        }
      }
    }
    loadFile();
  }, [webcontainer, activeFile]);

  const handleEditorChange = async (value) => {
    setCode(value);
    if (webcontainer && activeFile) {
      try {
        await webcontainer.fs.writeFile(activeFile, value);
      } catch (error) {
        console.error(`Failed to write file ${activeFile}:`, error);
      }
    }
  };

  // Basic language detection
  const getLanguage = (filename) => {
    if (!filename) return 'javascript';
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'md':
        return 'markdown';
      default:
        return 'javascript';
    }
  };

  return (
    <div className="flex-1 w-full h-full">
      <Editor
        height="100%"
        language={getLanguage(activeFile)}
        theme="vs-dark"
        value={code}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
          padding: { top: 16 }
        }}
      />
    </div>
  );
}
