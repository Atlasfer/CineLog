// pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Heart, Plus, Search } from 'lucide-react';
import { Container, Row, Col, Card, Form, Button, Nav, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

import Header from '../component/Header';
import Carousels from '../component/Carousels';
import AddToListModal from './AddList';

export default function HomePage({ user, appData, setAppData }) {
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [genres, setGenres] = useState([]);

  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const navigate = useNavigate();

  // Fetch data saat mount
  useEffect(() => {
    fetchGenres();
    fetchTrendingMovies();
    fetchDiscoverMovies();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      searchMovies();
    } else if (selectedGenre !== 'All') {
      filterByGenre();
    } else {
      fetchDiscoverMovies();
    }
  }, [searchQuery, selectedGenre]);

  const fetchGenres = async () => {
    try {
      const res = await api.get('/movies/genres');
      setGenres(res.data || []);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const fetchTrendingMovies = async () => {
    try {
      const res = await api.get('/movies/trending', {
        params: { timeWindow: 'week' }
      });
      setTrending(res.data.slice(0, 10));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDiscoverMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/movies/discover', {
        params: {
          sort_by: 'popularity.desc',
          page: 1
        }
      });
      setMovies(res.data);
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/movies/search', {
        params: { query: searchQuery }
      });
      setMovies(res.data);
    } catch (err) {
      console.error('Error searching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterByGenre = async () => {
    try {
      setLoading(true);
      const res = await api.get('/movies/discover', {
        params: {
          genreIds: selectedGenre,
          sortBy: 'popularity.desc',
          page: 1
        }
      });
      setMovies(res.data);
    } catch (err) {
      console.error('Error filtering movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = (movie) => {
    if (!user) {
      navigate('/auth', { state: { from: '/' } });
      return;
    }
    setSelectedMovie(movie);
    setShowAddToListModal(true);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <div className="bg-dark min-vh-100 text-white">
      {/* Header Baru */}
      <Header onNavigateToWatchlist={() => navigate('/watchlist')} />

      {/* Trending Carousel */}
      <div id="trending">
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
        <div className="mb-4 overflow-auto">
          <Nav variant="pills" className="flex-nowrap">
            <Nav.Item key="all">
              <Nav.Link
                active={selectedGenre === 'All'}
                onClick={() => {
                  setSelectedGenre('All');
                  setSearchQuery('');
                }}
                className={selectedGenre === 'All' ? 'bg-danger text-white' : 'text-white'}
              >
                All
              </Nav.Link>
            </Nav.Item>
            {genres.map(genre => (
              <Nav.Item key={genre.id}>
                <Nav.Link
                  active={selectedGenre === genre.id.toString()}
                  onClick={() => {
                    setSelectedGenre(genre.id.toString());
                    setSearchQuery('');
                  }}
                  className={selectedGenre === genre.id.toString() ? 'bg-danger text-white' : 'text-white'}
                >
                  {genre.name}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>
        
        {/* Movie Grid */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
          </div>
        ) : (
          <Row xs={2} sm={3} md={4} lg={6} className="g-4">
            {movies.map(movie => {
              return (
                <Col key={movie.tmdb_id}>
                  <Card 
                    className="bg-dark border-0 overflow-hidden h-100 shadow-lg movie-card"
                    role="button"
                    onClick={() => handleMovieClick(movie.tmdb_id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="object-fit-cover"
                        style={{ height: '300px' }}
                        onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                      }}
                      />
                      <div className="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-0 hover:opacity-80 transition d-flex align-items-center justify-content-center gap-3">
                        <Button
                          size="sm"
                          variant="light"
                          className="rounded-circle p-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToList(movie);
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
                        {movie.release_year || 'N/A'}
                      </Card.Text>
                      {movie.vote_average && (
                      <div className="d-flex align-items-center gap-1">
                        <span className="text-warning">★</span>
                        <span className="text-white small">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      {/* Add to List Modal */}
      {selectedMovie && (
        <AddToListModal
          show={showAddToListModal}
          movie={selectedMovie}
          onClose={() => {
            setShowAddToListModal(false);
            setSelectedMovie(null);
          }}
          onListAdded={() => {
            // Refresh lists
            api.get('/lists').then(res => {
              setAppData(prev => ({
                ...prev,
                customLists: res.data.data || res.data || []
              }));
            });
          }}
        />
      )}
    </div>
  );
}