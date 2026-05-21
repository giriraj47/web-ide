import { useState } from 'react';
import { Play, RotateCw, ExternalLink, LayoutPanelLeft } from 'lucide-react';

export default function PreviewPane({ url }) {
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    if (!url) return;
    setIsLoading(true);
    setKey(k => k + 1);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="flex flex-col h-full bg-[#ffffff] text-black">
      <div className="h-9 bg-[#f3f3f3] border-b border-[#e5e5e5] flex items-center px-2 select-none">
        
        <div className="flex space-x-1.5 mr-4">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>

        <div className="flex-1 flex items-center bg-white rounded border border-[#e5e5e5] px-2 py-0.5 mx-2 text-xs text-gray-600 space-x-2">
          <button onClick={handleRefresh} className="hover:text-black">
            <RotateCw size={12} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <span className="flex-1 truncate">{url || 'localhost:3000'}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-500">
          <button 
            className="hover:text-black p-1 transition-colors"
            onClick={() => url && window.open(url, '_blank')}
            disabled={!url}
          >
            <ExternalLink size={14} className={url ? '' : 'opacity-40'} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 relative w-full h-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full w-full text-gray-400 space-y-2">
            <RotateCw size={24} className="animate-spin" />
            <span className="text-sm">Reloading preview...</span>
          </div>
        ) : url ? (
          <iframe 
            key={key}
            src={url} 
            className="w-full h-full border-none bg-white" 
            allow="cross-origin-isolated" 
          />
        ) : (
          <div className="flex flex-col items-center text-gray-500 space-y-4">
            <LayoutPanelLeft size={48} className="text-gray-300" />
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700">Live Preview</h3>
              <p className="text-sm">Run <code>npm start</code> in the terminal to see your app.</p>
            </div>
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors opacity-50 cursor-not-allowed">
              <Play size={14} />
              <span>Waiting for server...</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
