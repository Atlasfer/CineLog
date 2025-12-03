import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, List, Film } from 'lucide-react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MyWatchList() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch semua list user
  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const res = await axios.get(`${API_URL}/lists`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Asumsi backend mengembalikan { lists: [...] } atau langsung array
      setLists(res.data.lists || res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
      } else {
        setError('Gagal memuat daftar');
      }
    } finally {
      setLoading(false);
    }
  };

  // Buat list baru
  const createList = async () => {
    if (!listName.trim()) return;

    try {
      await axios.post(
        `${API_URL}/lists`,
        { name: listName, description: listDescription },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      closeModal();
      fetchLists();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat list');
    }
  };

  // Update list
  const updateList = async () => {
    if (!editingList || !listName.trim()) return;

    try {
      await axios.put(
        `${API_URL}/lists/${editingList.id}`,
        { name: listName, description: listDescription },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      closeModal();
      fetchLists();
    } catch (err) {
      alert('Gagal mengupdate list');
    }
  };

  // Hapus list
  const deleteList = async (listId) => {
    if (!window.confirm('Hapus list ini? Semua film di dalamnya akan dihapus dari list.')) return;

    try {
      await axios.delete(`${API_URL}/lists/${listId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchLists();
    } catch (err) {
      alert('Gagal menghapus list');
    }
  };

  // Hapus film dari list
  const removeMovieFromList = async (listId, movieId) => {
    if (!window.confirm('Hapus film ini dari list?')) return;

    try {
      await axios.delete(`${API_URL}/lists/${listId}/movies/${movieId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchLists(); // refresh
    } catch (err) {
      alert('Gagal menghapus film dari list');
    }
  };

  // Buka modal create/edit
  const openCreateModal = () => {
    setEditingList(null);
    setListName('');
    setListDescription('');
    setShowModal(true);
  };

  const openEditModal = (list) => {
    setEditingList(list);
    setListName(list.name);
    setListDescription(list.description || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingList(null);
    setListName('');
    setListDescription('');
  };

  // Navigasi ke detail film
  const goToMovie = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  if (loading) {
    return (
      <div className="bg-dark min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="danger" />
        <span className="text-secondary ms-3">Memuat daftar...</span>
      </div>
    );
  }

  return (
    <div className="bg-dark min-vh-100">
      {/* Header */}
      <div className="bg-dark border-bottom border-secondary pt-5 pb-4">
        <Container>
          <Row className="align-items-center justify-content-between">
            <Col md={8}>
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="p-3 bg-danger bg-opacity-25 rounded-3">
                  <List size={32} className="text-danger" />
                </div>
                <h2 className="text-white display-4 mb-0">My Lists</h2>
              </div>
              <p className="text-secondary lead">Kelola koleksi film sesuai keinginanmu</p>
            </Col>
            <Col md={4} className="text-md-end">
              <Button onClick={openCreateModal} variant="danger" size="lg" className="d-flex align-items-center gap-2">
                <Plus size={20} />
                Buat List Baru
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        {error && <Alert variant="danger">{error}</Alert>}

        {lists.length === 0 ? (
          <Card className="bg-dark border-secondary text-center p-5">
            <div className="mx-auto mb-4 bg-secondary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
              <List size={40} className="text-secondary" />
            </div>
            <h3 className="text-white mb-3">Belum Ada List</h3>
            <p className="text-secondary mb-4">Buat list pertamamu untuk mengatur film favorit</p>
            <Button onClick={openCreateModal} variant="danger" size="lg">
              <Plus size={20} className="me-2" />
              Buat List Pertama
            </Button>
          </Card>
        ) : (
          <div className="space-y-5">
            {lists.map(list => (
              <Card key={list.id} className="bg-dark border-secondary shadow-lg">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h3 className="text-white h4 mb-2">{list.name}</h3>
                      {list.description && <p className="text-secondary mb-1">{list.description}</p>}
                      <small className="text-muted">
                        Dibuat {new Date(list.createdAt).toLocaleDateString('id-ID')}
                      </small>
                      <span className="badge bg-danger bg-opacity-25 text-danger ms-3">
                        {list.movieIds?.length || 0} film
                      </span>
                    </div>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-secondary" onClick={() => openEditModal(list)}>
                        <Edit2 size={18} />
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => deleteList(list.id)}>
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>

                  {list.movieIds && list.movieIds.length > 0 ? (
                    <Row xs={2} sm={3} md={4} lg={6} className="g-4">
                      {list.movieIds.map(movieId => (
                        <Col key={movieId}>
                          <div
                            className="position-relative overflow-hidden rounded-3 shadow cursor-pointer"
                            onClick={() => goToMovie(movieId)}
                          >
                            <div className="ratio ratio-2x3 bg-secondary bg-opacity-10">
                              <div className="d-flex align-items-center justify-content-center">
                                <Film size={40} className="text-secondary" />
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="danger"
                              className="position-absolute top-0 end-0 m-2 rounded-circle"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMovieFromList(list.id, movieId);
                              }}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                          <div className="mt-2 text-center">
                            <small className="text-white d-block text-truncate">Film ID: {movieId}</small>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Alert variant="secondary" className="text-center py-4">
                      <Film size={32} className="mb-3 text-muted" />
                      <p className="text-secondary mb-0">Belum ada film di list ini</p>
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>

      {/* Modal Create / Edit List */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton className="bg-dark border-secondary">
          <Modal.Title className="text-white">
            {editingList ? 'Edit List' : 'Buat List Baru'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="text-light">Nama List</Form.Label>
              <Form.Control
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="bg-secondary text-white border-secondary"
                placeholder="Contoh: Must-Watch 2025, Film Horor Favorit"
                autoFocus
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="text-light">Deskripsi (opsional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={listDescription}
                onChange={(e) => setListDescription(e.target.value)}
                className="bg-secondary text-white border-secondary resize-none"
                placeholder="Jelaskan isi list ini..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="secondary" onClick={closeModal}>Batal</Button>
          <Button
            variant="danger"
            onClick={editingList ? updateList : createList}
            disabled={!listName.trim()}
          >
            {editingList ? 'Simpan Perubahan' : 'Buat List'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
export default MyWatchList;