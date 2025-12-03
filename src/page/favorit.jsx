import { useState, useEffect } from 'react';
import { Heart, Star } from 'lucide-react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavbarComponent from '../component/Navbar';
import './favoritStyle.css';


function MyFavorit() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch daftar favorit dari backend
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(`${API_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Asumsi backend mengembalikan array film lengkap (bukan hanya ID)
      setFavorites(res.data.favorites || res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        // Token kadaluarsa atau belum login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
        return;
      }

      setError(err.response?.data?.message || 'Gagal memuat favorit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Hapus dari favorit
  const removeFromFavorites = async (movieId) => {
    if (!window.confirm('Hapus film ini dari favorit?')) return;

    try {
      await axios.delete(`${API_URL}/favorites/${movieId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Update UI langsung tanpa refetch (optimistic update)
      setFavorites(prev => prev.filter(movie => movie.id !== movieId));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus dari favorit');
    }
  };

  // Jalankan saat komponen mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Fungsi navigasi ke detail film
  const goToMovieDetail = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <div className="min-vh-100 bg-dark">
        <NavbarComponent />
      {/* Header */}
      <div className="bg-dark border-bottom border-secondary border-opacity-25">
        <Container className="py-5">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="p-3 bg-danger bg-opacity-25 rounded-3">
              <Heart className="text-danger" size={32} fill="currentColor" />
            </div>
            <h2 className="text-white display-5">My Favorites</h2>
          </div>
          <p className="text-secondary fs-5">
            {loading
              ? 'Memuat favorit...'
              : favorites.length === 0
              ? 'Belum ada film favorit'
              : `${favorites.length} film di favoritmu`}
          </p>
        </Container>
      </div>

      <Container className="py-5">
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
            <p className="text-secondary mt-3">Memuat favorit...</p>
          </div>
        ) : favorites.length === 0 ? (
          // Empty State
          <div className="text-center p-5 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-3">
            <div style={{ maxWidth: '400px' }} className="mx-auto">
              <div className="ratio ratio-1x1 mx-auto mb-4 bg-secondary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px' }}>
                <Heart className="text-secondary" size={40} />
              </div>
              <h3 className="text-white mb-3">Belum Ada Favorit</h3>
              <p className="text-secondary fs-5 mb-2">Mulai tambahkan film favoritmu</p>
              <p className="text-secondary text-opacity-75">
                Klik ikon hati pada film untuk menambahkannya ke favorit
              </p>
              <Button onClick={() => navigate('/')} className="btn-film mt-3">
                Jelajahi Film
              </Button>
            </div>
          </div>
        ) : (
          // Grid Film Favorit
          <Row xs={2} sm={3} md={4} lg={5} xl={6} className="g-4">
            {favorites.map((movie) => {
              // Cari rating user untuk film ini (jika ada)
              const userRating = movie.userRating || movie.rating; // tergantung struktur data dari backend

              return (
                <Col key={movie.id}>
                  <Card className="bg-dark text-white border-0 movie-card-group">
                    <div
                      className="position-relative overflow-hidden rounded-3 shadow-lg cursor-pointer poster-container"
                      onClick={() => goToMovieDetail(movie.id)}
                      style={{ paddingBottom: '150%' }}
                    >
                      <Card.Img
                        src={movie.poster || movie.poster_path || 'https://via.placeholder.com/300x450?text=No+Image'}
                        alt={movie.title}
                        className="w-100 h-100 object-fit-cover position-absolute top-0 start-0 img-scale-on-hover"
                      />

                      {/* Rating Badge (jika sudah dirating) */}
                      {userRating && (
                        <Badge
                          bg="dark"
                          className="position-absolute top-0 start-0 m-2 p-2 bg-opacity-75 d-flex align-items-center rounded-3"
                        >
                          <Star className="text-warning me-1" size={16} fill="currentColor" />
                          <span className="text-white small">{userRating}</span>
                        </Badge>
                      )}

                      {/* Overlay saat hover */}
                      <div className="position-absolute inset-0 bg-black bg-opacity-0 transition-opacity-bg-hover overlay-fade">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromFavorites(movie.id);
                          }}
                          variant="danger"
                          className="rounded-circle position-absolute top-0 end-0 m-3 btn-icon-sm"
                          title="Hapus dari favorit"
                        >
                          <Heart size={16} fill="currentColor" />
                        </Button>

                        <div className="position-absolute bottom-0 left-0 w-100 p-3 overlay-content-fade">
                          <p className="text-white small mb-1 text-truncate">{movie.title}</p>
                          <div className="d-flex align-items-center small text-secondary">
                            <span>{movie.year || movie.release_date?.split('-')[0]}</span>
                            <span className="mx-1">•</span>
                            <span className="text-truncate">
                              {movie.genre || movie.genres?.map(g => g.name).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Card.Body className="p-0 pt-2">
                      <h3 className="text-white small text-truncate mb-0">{movie.title}</h3>
                      <p className="text-secondary small mb-0">
                        {movie.year || movie.release_date?.split('-')[0]}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </div>
  );
}
export default MyFavorit;