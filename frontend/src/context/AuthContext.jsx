// This Context keeps track of WHO is logged in (a normal user or an admin)
// and provides login/logout functions any page/component can use.
// We store the token + user info in localStorage so the login persists across page refreshes.

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Custom hook so components can easily do: const { user, login, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // Try to load existing login info from localStorage when the app first starts
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [role, setRole] = useState(() => localStorage.getItem('role') || null);

  // Call this after a successful login/register API response
  function login(token, userData, userRole) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
    setUser(userData);
    setRole(userRole);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
  }

  const value = {
    user,
    role,               // 'user' or 'admin'
    isLoggedIn: !!user,
    isAdmin: role === 'admin',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
