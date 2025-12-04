import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Image, Alert } from 'react-bootstrap';
import { Home, List, Heart, User, LogOut } from 'lucide-react';
import NavbarComponent from './component/Navbar';
import api from './lib/api';

// Pages
import HomePage from './page/Home';
import Profile from './page/Profile';
import MyWatchList from './page/MyWatchList'; 
import MyFavorit from './page/favorit';
import DetailFilm from './page/DetailFilm';
import AuthPage from './page/Auth';

// Protected Route Component
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-vh-100 d-flex justify-content-center align-items-center text-white">Loading...</div>;
  return user ? children : <Navigate to="/auth" replace state={{ from: window.location.pathname }} />;
}

function Layout({ user, setUser, appData, setAppData }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setAppData({ customLists: [], favorites: [], ratings: [], quotes: [] });
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
            <Route path="/" element={<HomePage appData={{ user, ...appData }} />} />
            <Route path="/movie/:movieId" element={<DetailFilm appData={{ user, ...appData }} />} />

            {/* Protected Routes */}
            <Route path="/watchlist" element={
              <ProtectedRoute>
                <MyWatchList appData={{ user, ...appData }} />
              </ProtectedRoute>
            } />
            <Route path="/favorit" element={
              <ProtectedRoute>
                <MyFavorit appData={{ user, ...appData }} />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile user={user} />
              </ProtectedRoute>
            } />

            {/* Auth */}
            <Route path="/auth" element={
              user ? <Navigate to="/" /> : <AuthPage setUser={setUser} setAppData={setAppData} />
            } />
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
    favorites: [],
    ratings: [],
    quotes: []
  });

  // Load user + data saat app mount
  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);

        const [lists, favs, ratings, quotes] = await Promise.all([
          api.get('/lists'),
          api.get('/favorites'),
          api.get('/ratings'),
          api.get('/quotes')
        ]);

        setAppData({
          customLists: lists.data,
          favorites: favs.data.map(f => f.movieId),
          ratings: ratings.data,
          quotes: quotes.data
        });
      } catch (err) {
        console.log("Not logged in");
      }
    };
    init();
  }, []);

  return (
    <Layout user={user} setUser={setUser} appData={appData} setAppData={setAppData} />
  );
}