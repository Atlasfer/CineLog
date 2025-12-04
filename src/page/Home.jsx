// pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Heart, Plus, Search } from 'lucide-react';
import { Container, Row, Col, Card, Form, Button, Nav, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

import Header from '../component/Header';
import Carousels from '../component/Carousels';
import AddToListModal from './AddList';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [customLists, setCustomLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const TMDB_API = 'https://api.themoviedb.org/3';
  const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;

  // Fetch data saat mount
  useEffect(() => {
    fetchUserData();
    fetchTrendingMovies();
    fetchDiscoverMovies();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [favRes, listRes] = await Promise.all([
        axios.get(`${API_URL}/favorites`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/lists`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setFavorites(favRes.data.favorites || []);
      setCustomLists(listRes.data.lists || listRes.data);
    } catch (err) {
      console.log("User not logged in or error:", err);
    }
  };

  const fetchTrendingMovies = async () => {
    try {
      const res = await api.get('/movies/trending', {
        params: { timeWindow: 'week' }
      });
      setTrending(res.data.results.slice(0, 10));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDiscoverMovies = async () => {
    try {
      const res = await api.get('/movies/discover', {
        params: {
          sort_by: 'popularity.desc',
          page: 1
        }
      });
      setMovies(res.data.results);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const toggleFavorite = async (movieId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    try {
      if (favorites.includes(movieId)) {
        await axios.delete(`${API_URL}/favorites/${movieId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites(prev => prev.filter(id => id !== movieId));
      } else {
        await axios.post(`${API_URL}/favorites`, { movieId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites(prev => [...prev, movieId]);
      }
    } catch (err) {
      alert('Gagal mengubah favorit');
    }
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || movie.genre_ids?.includes(parseInt(selectedGenre));
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="bg-dark min-vh-100 text-white">
      {/* Header Baru */}
      <Header onNavigateToWatchlist={() => navigate('/lists')} />

      {/* Trending Carousel */}
      <div id="trending-section">
        <Carousels movies={trending} />
      </div>

      <Container className="py-5">
        <h2 className="mb-4">Discover Movies</h2>

        {/* Search */}
        <Form.Control
          type="text"
          placeholder="Cari film..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 bg-secondary text-white border-0"
        />

        {/* Genre Filter */}
        <div className="mb-4 overflow-x-auto">
          <Nav variant="pills" className="flex-nowrap">
            {['All', '28', '12', '16', '35', '27'].map(id => {
              const genreNames = {
                'All': 'All',
                '28': 'Action',
                '12': 'Adventure',
                '16': 'Animation',
                '35': 'Comedy',
                '27': 'Horror'
              };
              return (
                <Nav.Item key={id}>
                  <Nav.Link
                    active={selectedGenre === id}
                    onClick={() => setSelectedGenre(id)}
                    className="text-white"
                  >
                    {genreNames[id] || id}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>
        </div>
        {/* Movie Grid */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
          </div>
        ) : (
          <Row xs={2} sm={3} md={4} lg={6} className="g-4">
            {filteredMovies.map(movie => {
              const isFavorite = favorites.includes(movie.id.toString());
              return (
                <Col key={movie.id}>
                  <Card 
                    className="bg-dark border-0 overflow-hidden h-100 shadow-lg movie-card"
                    role="button"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="object-fit-cover"
                        style={{ height: '300px' }}
                      />
                      <div className="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-0 hover:opacity-80 transition d-flex align-items-center justify-content-center gap-3">
                        <Button
                          size="sm"
                          variant={isFavorite ? 'danger' : 'light'}
                          className="rounded-circle p-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(movie.id.toString());
                          }}
                        >
                          <Heart size={20} fill={isFavorite ? 'red' : 'none'} />
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          className="rounded-circle p-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMovieId(movie.id.toString());
                            setShowAddToListModal(true);
                          }}
                        >
                          <Plus size={20} />
                        </Button>
                      </div>
                    </div>
                    <Card.Body className="p-3">
                      <Card.Title className="text-white small fw-bold text-truncate">
                        {movie.title}
                      </Card.Title>
                      <Card.Text className="text-secondary small">
                        {new Date(movie.release_date).getFullYear() || 'N/A'}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      {/* Add to List Modal */}
      <AddToListModal
        show={showAddToListModal}
        movieId={selectedMovieId}
        onClose={() => {
          setShowAddToListModal(false);
          setSelectedMovieId(null);
        }}
        onListAdded={() => fetchUserData()}
      />
    </div>
  );
}