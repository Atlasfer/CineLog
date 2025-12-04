import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {ArrowLeft, Heart, Plus, Star, MessageSquare,Edit2, Trash2, X} from 'lucide-react';
import {Container, Row, Col, Button, Modal, Form, Badge, Card,Spinner, Alert} from 'react-bootstrap';
import AddToListModal from './AddList.jsx';

function DetailFilm() {
  const { movieId } = useParams(); 
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [userData, setUserData] = useState({
    isFavorite: false,
    rating: null,
    quotes: [],
    listsWithMovie: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);

  const [ratingValue, setRatingValue] = useState(5);
  const [review, setReview] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [character, setCharacter] = useState('');
  const [editingQuoteId, setEditingQuoteId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchMovieDetail();
  }, [movieId]);

  const fetchMovieDetail = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Ambil detail film + data user dalam satu request
      const res = await axios.get(`${API_URL}/movies/${movieId}`, { headers });

      setMovie(res.data.movie);
      setUserData({
        isFavorite: res.data.isFavorite || false,
        rating: res.data.rating || null,
        quotes: res.data.quotes || [],
        listsWithMovie: res.data.listsWithMovie || []
      });

      // Jika ada rating, isi form
      if (res.data.rating) {
        setRatingValue(res.data.rating.rating);
        setReview(res.data.rating.review || '');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/auth');
        return;
      }
      setError(err.response?.data?.message || 'Film tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Favorite
  const toggleFavorite = async () => {
    try {
      if (userData.isFavorite) {
        await axios.delete(`${API_URL}/favorites/${movieId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post(`${API_URL}/favorites`, { movieId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setUserData(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah favorit');
    }
  };

  // Rating
  const saveRating = async () => {
    try {
      const payload = { movieId, rating: ratingValue, review: review || null };
      if (userData.rating) {
        await axios.put(`${API_URL}/ratings/${userData.rating.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post(`${API_URL}/ratings`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setShowRatingModal(false);
      fetchMovieDetail();
    } catch (err) {
      alert('Gagal menyimpan rating');
    }
  };

  const deleteRating = async () => {
    if (!window.confirm('Hapus rating ini?')) return;
    try {
      await axios.delete(`${API_URL}/ratings/${userData.rating.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserData(prev => ({ ...prev, rating: null }));
    } catch (err) {
      alert('Gagal menghapus rating');
    }
  };

  // Quote
  const saveQuote = async () => {
    try {
      const payload = { movieId, quote: quoteText, character: character || null };
      if (editingQuoteId) {
        await axios.put(`${API_URL}/quotes/${editingQuoteId}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post(`${API_URL}/quotes`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setShowQuoteModal(false);
      resetQuoteForm();
      fetchMovieDetail();
    } catch (err) {
      alert('Gagal menyimpan quote');
    }
  };

  const deleteQuote = async (quoteId) => {
    if (!window.confirm('Hapus quote ini?')) return;
    try {
      await axios.delete(`${API_URL}/quotes/${quoteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserData(prev => ({
        ...prev,
        quotes: prev.quotes.filter(q => q.id !== quoteId)
      }));
    } catch (err) {
      alert('Gagal menghapus quote');
    }
  };

  const openQuoteModal = (quote = null) => {
    if (quote) {
      setEditingQuoteId(quote.id);
      setQuoteText(quote.quote);
      setCharacter(quote.character || '');
    } else {
      resetQuoteForm();
    }
    setShowQuoteModal(true);
  };

  const resetQuoteForm = () => {
    setEditingQuoteId(null);
    setQuoteText('');
    setCharacter('');
  };

  // List
  const addToList = async (listId) => {
    try {
      await axios.post(`${API_URL}/lists/${listId}/movies`, { movieId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchMovieDetail();
      setShowAddToListModal(false);
    } catch (err) {
      alert('Gagal menambah ke list');
    }
  };

  const removeFromList = async (listId) => {
    try {
      await axios.delete(`${API_URL}/lists/${listId}/movies/${movieId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchMovieDetail();
    } catch (err) {
      alert('Gagal menghapus dari list');
    }
  };

  // Loading & Error
  if (loading) {
    return (
      <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <Container className="py-5 text-center text-white">
        <h3>{error || 'Film tidak ditemukan'}</h3>
        <Button variant="danger" onClick={() => navigate(-1)}>Kembali</Button>
      </Container>
    );
  }

  return (
    <div className="bg-gray-950 min-vh-100">
      {/* Hero Section */}
      <div className="position-relative">
        <div className="position-absolute inset-0 backdrop-container">
          <img src={movie.backdrop || movie.poster} alt="" className="w-100 h-100 object-fit-cover backdrop-img" />
          <div className="position-absolute inset-0 bg-dark-gradient-overlay"></div>
        </div>

        <Container className="position-relative py-5">
          <Button onClick={() => navigate(-1)} variant="link" className="text-secondary text-decoration-none d-flex align-items-center gap-2 mb-4">
            <ArrowLeft size={20} /> Back
          </Button>

          <Row className="g-5">
            <Col xs={12} lg={4}>
              <div className="ratio ratio-2x3 rounded-3 overflow-hidden shadow-lg">
                <img src={movie.poster} alt={movie.title} className="w-100 h-100 object-fit-cover" />
              </div>
            </Col>

            <Col xs={12} lg={8}>
              <h1 className="text-white display-4">{movie.title}</h1>
              <div className="d-flex align-items-center gap-3 my-3">
                <Badge bg="danger">{movie.year || movie.release_date?.split('-')[0]}</Badge>
                <span className="text-secondary">•</span>
                <span className="text-light">{movie.genres?.map(g => g.name).join(', ') || movie.genre}</span>
              </div>

              <p className="text-secondary fs-5">{movie.overview || movie.description}</p>

              <div className="d-flex flex-wrap gap-3 my-4">
                <Button
                  onClick={toggleFavorite}
                  variant={userData.isFavorite ? 'danger' : 'secondary'}
                  className="d-flex align-items-center gap-2"
                >
                  <Heart size={20} fill={userData.isFavorite ? 'currentColor' : 'none'} />
                  {userData.isFavorite ? 'Unfavorite' : 'Favorite'}
                </Button>
                <Button onClick={() => setShowAddToListModal(true)} variant="secondary" className="d-flex align-items-center gap-2">
                  <Plus size={20} /> Add to List
                </Button>
              </div>

              {userData.listsWithMovie.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-3">
                  {userData.listsWithMovie.map(list => (
                    <Badge key={list.id} bg="secondary" className="d-flex align-items-center gap-2">
                      {list.name}
                      <X size={16} className="cursor-pointer" onClick={() => removeFromList(list.id)} />
                    </Badge>
                  ))}
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        {/* Rating Section */}
        <Card className="bg-secondary bg-opacity-10 border-secondary border-opacity-25 mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="text-white d-flex align-items-center gap-3">
                <Star className="text-danger" /> Your Rating
              </h3>
              {userData.rating ? (
                <div className="d-flex gap-2">
                  <Button size="sm" onClick={() => setShowRatingModal(true)}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={deleteRating}>Delete</Button>
                </div>
              ) : (
                <Button variant="danger" onClick={() => setShowRatingModal(true)}>Add Rating</Button>
              )}
            </div>

            {userData.rating ? (
              <div className="p-4 bg-secondary bg-opacity-25 rounded-3">
                <div className="d-flex gap-1 mb-2">
                  {[...Array(10)].map((_, i) => (
                    <Star key={i} size={28} fill={i < userData.rating.rating ? '#ffc107' : 'none'} className={i < userData.rating.rating ? 'text-warning' : 'text-secondary'} />
                  ))}
                  <span className="text-white fs-4 ms-2">{userData.rating.rating}/10</span>
                </div>
                {userData.rating.review && <p className="text-light fst-italic">"{userData.rating.review}"</p>}
              </div>
            ) : (
              <div className="text-center py-5 text-secondary">
                <Star size={48} className="mb-3" />
                <p>Belum ada rating</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Quotes Section */}
        <Card className="bg-secondary bg-opacity-10 border-secondary border-opacity-25">
          <Card.Body>
            <div className="d-flex justify-content-between mb-4">
              <h3 className="text-white d-flex align-items-center gap-3">
                <MessageSquare className="text-danger" /> Quotes
              </h3>
              <Button variant="danger" size="sm" onClick={() => openQuoteModal()}>Add Quote</Button>
            </div>

            {userData.quotes.length > 0 ? (
              userData.quotes.map(q => (
                <div key={q.id} className="p-3 bg-secondary bg-opacity-20 rounded mb-3 d-flex justify-content-between">
                  <div>
                    <p className="text-white">"{q.quote}"</p>
                    <p className="text-secondary small">— {q.character || 'Unknown'}</p>
                  </div>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={() => openQuoteModal(q)}>Edit</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => deleteQuote(q.id)}>Delete</Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary text-center py-4">Belum ada quote</p>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Modals */}
      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>Rate {movie.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div className="d-flex gap-2">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <Button key={n} variant="link" onClick={() => setRatingValue(n)}>
                    <Star size={32} fill={n <= ratingValue ? '#ffc107' : 'none'} className={n <= ratingValue ? 'text-warning' : 'text-secondary'} />
                  </Button>
                ))}
              </div>
            </Form.Group>
            <Form.Group>
              <Form.Label>Review (opsional)</Form.Label>
              <Form.Control as="textarea" rows={3} value={review} onChange={e => setReview(e.target.value)} className="bg-secondary text-white" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={() => setShowRatingModal(false)}>Batal</Button>
          <Button variant="danger" onClick={saveRating}>Simpan</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showQuoteModal} onHide={() => setShowQuoteModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white"><Modal.Title>{editingQuoteId ? 'Edit' : 'Add'} Quote</Modal.Title></Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Quote</Form.Label>
              <Form.Control as="textarea" rows={3} value={quoteText} onChange={e => setQuoteText(e.target.value)} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Character</Form.Label>
              <Form.Control type="text" value={character} onChange={e => setCharacter(e.target.value)} placeholder="Siapa yang bilang?" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={() => setShowQuoteModal(false)}>Batal</Button>
          <Button variant="danger" onClick={saveQuote}>Simpan</Button>
        </Modal.Footer>
      </Modal>

      {showAddToListModal && (
        <AddToListModal
          movieId={movieId}
          onAddToList={addToList}
          onClose={() => setShowAddToListModal(false)}
        />
      )}
    </div>
  );
}
export default DetailFilm;