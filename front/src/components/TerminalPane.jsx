import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Terminal as TerminalIcon, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function TerminalPane({ isExpanded, toggleExpanded, webcontainer }) {
  const terminalRef = useRef(null);
  const termInstanceRef = useRef(null);
  const fitAddonRef = useRef(null);
  const shellProcessRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  // 1. Initialize Terminal UI only once
  useEffect(() => {
    if (!terminalRef.current || termInstanceRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#ffffff',
        selectionBackground: 'rgba(255, 255, 255, 0.3)',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontSize: 13,
      cursorBlinking: true,
      allowTransparency: true
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    
    term.writeln('\x1b[1;34mBooting WebContainer...\x1b[0m');

    termInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    const handleResize = () => {
      if (fitAddonRef.current && isExpanded) {
        fitAddonRef.current.fit();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    setTimeout(() => {
      fitAddon.fit();
    }, 50);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      termInstanceRef.current = null;
    };
  }, []);

  // 2. Connect WebContainer shell when available
  useEffect(() => {
    let process;
    let onDataDisposable;

    async function startShell() {
      if (!webcontainer || !termInstanceRef.current) return;
      if (shellProcessRef.current) return;

      try {
        termInstanceRef.current.writeln('\x1b[1;32mWebContainer is ready.\x1b[0m');
        process = await webcontainer.spawn('jsh');
        shellProcessRef.current = process;

        process.output.pipeTo(
          new WritableStream({
            write(data) {
              termInstanceRef.current.write(data);
            }
          })
        );

        const input = process.input.getWriter();
        onDataDisposable = termInstanceRef.current.onData((data) => {
          input.write(data);
        });

      } catch (err) {
        console.error('Failed to start shell:', err);
        termInstanceRef.current.writeln('\r\n\x1b[1;31mFailed to start shell.\x1b[0m');
      }
    }

    startShell();

    return () => {
      if (onDataDisposable) {
        onDataDisposable.dispose();
      }
      if (process) {
        process.kill();
      }
      shellProcessRef.current = null;
    };
  }, [webcontainer]);

  // Fit terminal when expanded state changes
  useEffect(() => {
    if (termInstanceRef.current && fitAddonRef.current && isExpanded && isVisible) {
      setTimeout(() => {
        fitAddonRef.current.fit();
      }, 100);
    }
  }, [isExpanded, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`border-t border-ide-border bg-ide-panel flex flex-col transition-all duration-300 ease-in-out`}
      style={{ height: isExpanded ? '300px' : '40px' }}
    >
      <div 
        className="flex items-center justify-between px-4 h-10 select-none cursor-pointer border-b border-transparent hover:bg-[#2a2d2e] transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center space-x-2 text-ide-text-active">
          <TerminalIcon size={16} />
          <span className="text-sm font-medium tracking-wide uppercase">Terminal</span>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-400">
          <button 
            className="p-1 hover:text-white hover:bg-gray-700 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button 
            className="p-1 hover:text-white hover:bg-red-500 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div 
        className={`flex-1 overflow-hidden p-2 ${!isExpanded ? 'hidden' : 'block'}`}
      >
        <div ref={terminalRef} className="h-full w-full" />
      </div>
    </div>
  );
}
