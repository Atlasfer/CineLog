import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Container} from 'react-bootstrap';
import NavbarComponent from './component/Navbar';
import api from './lib/api';

// Pages
import HomePage from './page/Home';
import Profile from './page/Profile';
import MyWatchList from './page/MyWatchList'; 
import DetailFilm from './page/DetailFilm';
import AuthPage from './page/Auth';

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/auth', { replace: true , state: { from: window.location.pathname }});
    }
  }, [token, navigate]);
  if (!token) {
    return null;
  }
  return children;
}

function Layout({ user, setUser, appData, setAppData }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAppData({ customLists: [], ratings: [], quotes: [] });
    navigate('/');
  };

  return (
    <div className="bg-dark text-white min-vh-100">
      {/* NAVBAR */}
      <NavbarComponent user={user} setUser={setUser} setAppData={setAppData} handleLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="pt-5 pb-5 pb-lg-0">
        <Container className="pt-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage user={user} appData={appData} setAppData={setAppData} />} />
            <Route path="/movie/:movieId" element={<DetailFilm user={user} appData={appData} setAppData={setAppData} />} />

            {/* Protected Routes */}
            <Route path="/watchlist" element={
              <ProtectedRoute>
                <MyWatchList user={user} appData={appData} setAppData={setAppData} />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile user={user} setUser={setUser} />
              </ProtectedRoute>
            } />

            <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage setUser={setUser} setAppData={setAppData} />} />
          </Routes>
        </Container>
      </main>
    </div>
  );
}

// Main App
export default function App() {
  const [user, setUser] = useState(null);
  const [appData, setAppData] = useState({
    customLists: [],
    ratings: [],
    quotes: []
  });

  // Load user + data saat app mount
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await api.get('/auth/profile');
        setUser(res.data);

        const [lists, quotes] = await Promise.all([
          api.get('/lists').catch(() => ({ data: { data: [] } })),
          api.get('/quotes').catch(() => ({ data: { data: [] } }))
        ]);

        setAppData({
          customLists: lists.data.data || lists.data || [],
          ratings: [],
          quotes: quotes.data.data || quotes.data || []
        });
      } catch (err) {
        console.log("Not logged in");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    };
    init();
  }, []);

  return (
    <Layout user={user} setUser={setUser} appData={appData} setAppData={setAppData} />
  );
}