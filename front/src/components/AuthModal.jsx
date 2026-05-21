import { useState } from 'react';
import { loginUser, registerUser } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = isLogin 
        ? await loginUser(email, password)
        : await registerUser(email, password);
        
      login(data.user, data.token);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#1e1e1e] border border-[#2a2d2e] rounded-lg p-6 w-full max-w-sm shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold text-white mb-6">
          {isLogin ? 'Log in to Save' : 'Create an Account'}
        </h2>
        
        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm border border-red-500/30">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-[#2d2d2d] text-white border border-[#3d3d3d] rounded p-2 focus:border-ide-accent outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-[#2d2d2d] text-white border border-[#3d3d3d] rounded p-2 focus:border-ide-accent outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-ide-accent hover:bg-blue-600 text-white font-medium py-2 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-ide-accent hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
