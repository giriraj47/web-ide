const API_BASE = 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const registerUser = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to register');
  }
  return response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to login');
  }
  return response.json();
};

export const getMe = async () => {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders()
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get user');
  }
  return response.json();
};

export const createProject = async (title, files) => {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title, files })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create project');
  }
  return response.json();
};

export const updateProject = async (id, title, files) => {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ title, files })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update project');
  }
  return response.json();
};

export const getProjectById = async (id) => {
  const response = await fetch(`${API_BASE}/projects/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch project');
  }
  return response.json();
};

export const getUserProjects = async () => {
  const response = await fetch(`${API_BASE}/projects`, {
    headers: getHeaders()
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user projects');
  }
  return response.json();
};
