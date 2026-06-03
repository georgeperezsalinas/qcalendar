import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('qcal_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const data = JSON.parse(localStorage.getItem('qcal_user') || '{}');
      setUser(data);
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const res = await axios.post('/api/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, cliente_id, nombre } = res.data;
    localStorage.setItem('qcal_token', access_token);
    localStorage.setItem('qcal_user', JSON.stringify({ cliente_id, nombre, email }));
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser({ cliente_id, nombre, email });
    return res.data;
  }

  function logout() {
    localStorage.removeItem('qcal_token');
    localStorage.removeItem('qcal_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
