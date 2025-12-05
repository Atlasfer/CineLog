import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {ArrowLeft, Heart, Plus, Star, MessageSquare,Edit2, Trash2, X} from 'lucide-react';
import {Container, Row, Col, Button, Modal, Form, Badge, Card,Spinner, Alert} from 'react-bootstrap';
import AddToListModal from './AddList';

function DetailFilm({ user, appData, setAppData }) {
  const { movieId } = useParams(); 
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User data untuk film ini
  const [userRating, setUserRating] = useState(null);
  const [userQuotes, setUserQuotes] = useState([]);
  const [listsWithMovie, setListsWithMovie] = useState([]);

  // Modal states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);

  //Form states
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [quoter, setQuoter] = useState('');
  const [editingQuote, setEditingQuote] = useState(null);

  useEffect(() => {
    fetchMovieDetail();
    if (user) {
      fetchUserData();
    }
  }, [movieId, user]);

  const fetchMovieDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/movies/${movieId}`); 
      
      setMovie(res.data);
    } catch (err) {
      setError(err.message || 'Film tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      // Fetch rating
      const ratingRes = await api.get(`/rating/${movieId}`, {
        params: { userId: user.id }
      });
      
      if (ratingRes.data.personalScore) {
        setUserRating({
          score: ratingRes.data.personalScore,
          review_text: ratingRes.data.personalReview
        });
        setRatingValue(ratingRes.data.personalScore);
        setReviewText(ratingRes.data.personalReview || '');
      }
    } catch (err) {
      console.log('No rating yet');
    }

    try {
      // Fetch quotes untuk movie ini
      const quotesRes = await api.get(`/quotes/movie/${movieId}`);
      setUserQuotes(quotesRes.data.data || quotesRes.data || []);
    } catch (err) {
      console.log('No quotes yet');
    }

    try {
      // Fetch lists yang berisi movie ini
      const listsRes = await api.get('/lists');
      const allLists = listsRes.data.data || listsRes.data || [];
      const filtered = allLists.filter(list => 
        list.movies?.some(m => m.tmdb_id === parseInt(movieId))
      );
      setListsWithMovie(filtered);
    } catch (err) {
      console.log('Error fetching lists');
    }
  };

  // Rating
  const saveRating = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const payload = {
        tmdbId: parseInt(movieId),
        userId: user.id,
        score: ratingValue,
        reviewText: reviewText || null,
        title: movie.title,
        release_year: movie.release_year,
        poster_path: movie.poster_path
      };

      if (userRating) {
        // Update existing rating
        await api.patch(`/rating/${movieId}`, {
          userId: user.id,
          score: ratingValue,
          reviewText: reviewText || null
        });
      } else {
        // Create new rating
        await api.post('/rating', payload);
      }

      setShowRatingModal(false);
      fetchUserData();
      alert('Rating berhasil disimpan!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan rating');
    }
  };

  const deleteRating = async () => {
    if (!window.confirm('Hapus rating ini?')) return;

    try {
      await api.delete(`/rating/${movieId}`, {
        data: { userId: user.id }
      });
      setUserRating(null);
      setRatingValue(5);
      setReviewText('');
      alert('Rating berhasil dihapus');
    } catch (err) {
      alert('Gagal menghapus rating');
    }
  };
  // Quote
  const openQuoteModal = (quote = null) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (quote) {
      setEditingQuote(quote);
      setQuoteText(quote.quote_text);
      setQuoter(quote.quoter || '');
    } else {
      setEditingQuote(null);
      setQuoteText('');
      setQuoter('');
    }
    setShowQuoteModal(true);
  };

  const saveQuote = async () => {
    try {
      const payload = {
        tmdbId: parseInt(movieId),
        quoteText,
        quoter: quoter || 'Unknown'
      };

      if (editingQuote) {
        await api.put(`/quotes/${editingQuote.id}`, payload);
      } else {
        await api.post('/quotes', payload);
      }

      setShowQuoteModal(false);
      setEditingQuote(null);
      setQuoteText('');
      setQuoter('');
      fetchUserData();
      alert('Quote berhasil disimpan!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan quote');
    }
  };

  const deleteQuote = async (quoteId) => {
    if (!window.confirm('Hapus quote ini?')) return;

    try {
      await api.delete(`/quotes/${quoteId}`);
      fetchUserData();
      alert('Quote berhasil dihapus');
    } catch (err) {
      alert('Gagal menghapus quote');
    }
  };

  // List
  const removeFromList = async (listId) => {
    if (!window.confirm('Hapus dari list ini?')) return;

    try {
      await api.delete(`/lists/${listId}/movies/${movieId}`);
      fetchUserData();
      alert('Berhasil dihapus dari list');
    } catch (err) {
      alert('Gagal menghapus dari list');
    }
  };

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
    <div className="bg-dark min-vh-100">
      {/* Hero Section */}
      <div className="position-relative" style={{ minHeight: '60vh' }}>
        <div 
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.9) 100%), url(https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <Container className="position-relative py-5 g-5" style={{ zIndex: 1 }}>
          <Button 
            onClick={() => navigate(-1)} 
            variant="link" 
            className="text-secondary text-decoration-none d-flex align-items-center gap-2 mb-4"
          >
            <ArrowLeft size={20} /> Back
          </Button>

          <Row className="g-5 align-items-center">
            <Col xs={12} lg={3}>
              <div style={{ width: '300px', height: '450px' }} className="rounded-5 overflow-hidden shadow-lg">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title} 
                  className="w-100 h-100 object-fit-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                  }}
                />
              </div>
            </Col>

            <Col xs={12} lg={8}>
              <h1 className="text-white display-4 mb-3">{movie.title}</h1>
              
              <div className="d-flex align-items-center gap-3 mb-3">
                <Badge bg="danger">{movie.release_year || 'N/A'}</Badge>
                {movie.runtime && (
                  <>
                    <span className="text-secondary">•</span>
                    <span className="text-light">{movie.runtime} min</span>
                  </>
                )}
                {movie.genres && movie.genres.length > 0 && (
                  <>
                    <span className="text-secondary">•</span>
                    <span className="text-light">{movie.genres.map(g => g.name).join(', ')}</span>
                  </>
                )}
              </div>

              {movie.vote_average && (
                <div className="d-flex align-items-center gap-2 mb-4">
                  <Star className="text-warning" fill="currentColor" size={20} />
                  <span className="text-white fs-6">{movie.vote_average.toFixed(1)}/10</span>
                  <span className="text-secondary">TMDB</span>
                </div>
              )}

              <p className="text-light fs-6 mb-4">{movie.overview}</p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <Button 
                  onClick={() => setShowAddToListModal(true)} 
                  variant="danger"
                  className="d-flex align-items-center gap-2"
                >
                  <Plus size={20} /> Add to List
                </Button>
              </div>

              {listsWithMovie.length > 0 && (
                <div>
                  <p className="text-secondary small mb-2">In your lists:</p>
                  <div className="d-flex flex-wrap gap-2">
                    {listsWithMovie.map(list => (
                      <Badge 
                        key={list.id} 
                        bg="secondary" 
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: 'pointer' }}
                      >
                        {list.name}
                        <X 
                          size={16} 
                          onClick={() => removeFromList(list.id)}
                        />
                      </Badge>
                    ))}
                  </div>
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
              <h3 className="text-white d-flex align-items-center gap-3 mb-0">
                <Star className="text-danger" /> Your Rating
              </h3>
              {user ? (
                userRating ? (
                  <div className="d-flex gap-2">
                    <Button size="sm" variant='outline-primary' onClick={() => setShowRatingModal(true)}>
                      <Edit2 size={16} /> Edit
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={deleteRating}>
                      <Trash2 size={16} /> Delete
                    </Button>
                  </div>
                ) : (
                  <Button variant="danger" onClick={() => setShowRatingModal(true)}>
                    Add Rating
                  </Button>
                )
              ) : (
                <Button variant="danger" onClick={() => navigate('/auth')}>
                  Login to Rate
                </Button>
              )}
            </div>

            {userRating ? (
              <div className="p-4 bg-secondary bg-opacity-25 rounded-3">
                <div className="d-flex gap-1 mb-3">
                  {[...Array(10)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={28} 
                      fill={i < userRating.score ? '#ffc107' : 'none'} 
                      className={i < userRating.score ? 'text-warning' : 'text-secondary'} 
                    />
                  ))}
                  <span className="text-white fs-4 ms-2">{userRating.score}/10</span>
                </div>
                {userRating.review_text && (
                  <p className="text-light fst-italic mb-0">"{userRating.review_text}"</p>
                )}
              </div>
            ) : (
              <div className="text-center py-5 text-secondary">
                <Star size={48} className="mb-3 opacity-50" />
                <p className="mb-0">Belum ada rating</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Quotes Section */}
        <Card className="bg-secondary bg-opacity-10 border-secondary border-opacity-25">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="text-white d-flex align-items-center gap-3 mb-0">
                <MessageSquare className="text-danger" /> Quotes
              </h3>
              {user ? (
                <Button variant="danger" size="sm" onClick={() => openQuoteModal()}>
                  Add Quote
                </Button>
              ) : (
                <Button variant="danger" size="sm" onClick={() => navigate('/auth')}>
                  Login to Add Quote
                </Button>
              )}
            </div>

            {userQuotes.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {userQuotes.map(quote => (
                  <div 
                    key={quote.id} 
                    className="p-3 bg-secondary bg-opacity-25 rounded-3 d-flex justify-content-between align-items-start"
                  >
                    <div className="flex-grow-1">
                      <p className="text-white mb-2">"{quote.quote_text}"</p>
                      <p className="text-secondary small mb-0">— {quote.quoter || 'Unknown'}</p>
                    </div>
                    {user && (
                      <div className="d-flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          onClick={() => openQuoteModal(quote)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger" 
                          onClick={() => deleteQuote(quote.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-secondary">
                <MessageSquare size={48} className="mb-3 opacity-50" />
                <p className="mb-0">Belum ada quote</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Rating Modal */}
      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>Rate {movie.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Rating (1-10)</Form.Label>
              <div className="d-flex gap-2 flex-wrap justify-content-center">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <Button 
                    key={n} 
                    variant="link" 
                    onClick={() => setRatingValue(n)}
                    className="p-1"
                  >
                    <Star 
                      size={32} 
                      fill={n <= ratingValue ? '#ffc107' : 'none'} 
                      className={n <= ratingValue ? 'text-warning' : 'text-secondary'} 
                    />
                  </Button>
                ))}
              </div>
              <p className="text-center text-white mt-2 fs-4">{ratingValue}/10</p>
            </Form.Group>
            <Form.Group>
              <Form.Label>Review (optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                value={reviewText} 
                onChange={e => setReviewText(e.target.value)} 
                className="bg-secondary text-white border-0"
                placeholder="Tulis review kamu tentang film ini..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="secondary" onClick={() => setShowRatingModal(false)}>Batal</Button>
          <Button variant="danger" onClick={saveRating}>Simpan Rating</Button>
        </Modal.Footer>
      </Modal>

      {/* Quote Modal */}
      <Modal show={showQuoteModal} onHide={() => setShowQuoteModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>{editingQuote ? 'Edit' : 'Add'} Quote</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Quote</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                value={quoteText} 
                onChange={e => setQuoteText(e.target.value)} 
                className="bg-secondary text-white border-0"
                placeholder="Masukkan quote dari film ini..."
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Character/Person</Form.Label>
              <Form.Control 
                type="text" 
                value={quoter} 
                onChange={e => setQuoter(e.target.value)} 
                className="bg-secondary text-white border-0"
                placeholder="Siapa yang mengucapkan quote ini?"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="secondary" onClick={() => setShowQuoteModal(false)}>Batal</Button>
          <Button 
            variant="danger" 
            onClick={saveQuote}
            disabled={!quoteText.trim()}
          >
            Simpan Quote
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add to List Modal */}
      {showAddToListModal && movie && (
        <AddToListModal
          show={showAddToListModal}
          movie={movie}
          onClose={() => setShowAddToListModal(false)}
          onListAdded={() => {
            fetchUserData();
            // Refresh lists di appData
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
export default DetailFilm;