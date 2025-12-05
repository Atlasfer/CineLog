import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Modal, Button, ListGroup, Alert, Spinner } from 'react-bootstrap';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

function AddToListModal({ show, movie, onClose, onListAdded }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToListId, setAddingToListId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      fetchUserLists();
    }
  }, [show]);

  const fetchUserLists = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        onClose();
        navigate('/auth');
        return;
      }

      const res = await api.get('/lists');
      const listsData = res.data.data || res.data || [];
      setLists(listsData);
    } catch (err) {
      if (err.response?.status === 401) {
        onClose();
        navigate('/auth');
        return;
      }
      setError('Gagal memuatHContinue');
      console.error(err);
    } finally {
    setLoading(false);
    }
    };
    const addToList = async (listId) => {
    // Memastikan data movie valid
    if (!movie || (!movie.id && !movie.tmdb_id)) {
        alert('Data film tidak valid');
        return;
    }
    
    // 1. Ekstrak tmdbId
    const tmdbId = movie.id || movie.tmdb_id; 
    
    // 2. Ambil tahun rilis dari 'release_date' dan konversi ke integer
    const releaseYear = movie.release_date 
        ? parseInt(movie.release_date.substring(0, 4)) 
        : (movie.release_year || null);

    // 3. Siapkan payload LENGKAP
    const payload = {
        tmdbId: tmdbId,
        title: movie.title || movie.name, // Gunakan movie.name jika media_type TV
        release_year: releaseYear, 
        poster_path: movie.poster_path,
        media_type: movie.media_type || 'movie' // Pastikan media_type juga dikirim
    };
    
    setAddingToListId(listId);
    
    try {
        // 4. KIRIM PAYLOAD LENGKAP
        const res = await api.post(`/lists/${listId}/movies`, payload); // ⭐ Perubahan di sini!

        if (res.data.success) {
            if (onListAdded) onListAdded();
            alert('Film berhasil ditambahkan ke list!');
            onClose();
        }
    } catch (err) {
        const message = err.response?.data?.message || 'Gagal menambahkan ke list';
        alert(message);
    } finally {
        setAddingToListId(null);
    }
};
    // Filter list yang belum ada movie ini
    const availableLists = lists.filter(list => {
    if (!list.movies || !movie) return true;
    return !list.movies.some(m => m.tmdb_id === movie.tmdb_id);
    });
    return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
    <Modal.Header className="bg-dark border-secondary d-flex justify-content-between align-items-center">
    <Modal.Title className="text-white">Add to List</Modal.Title>
    <Button variant="link" onClick={onClose} className="text-secondary p-0">
    <X size={24} />
    </Button>
    </Modal.Header>
      <Modal.Body className="bg-dark text-white">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
            <p className="text-secondary mt-3">Memuat daftar...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        ) : availableLists.length > 0 ? (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <ListGroup className="border-0">
              {availableLists.map(list => (
                <ListGroup.Item
                  key={list.id}
                  className="bg-secondary bg-opacity-10 border-secondary border-opacity-50 mb-2 rounded"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="text-white mb-1">{list.name}</h6>
                      {list.description && (
                        <p className="text-secondary small mb-1">{list.description}</p>
                      )}
                      <small className="text-muted">
                        {list.movies?.length || 0} film
                      </small>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={addingToListId === list.id}
                      className="d-flex align-items-center gap-1"
                      onClick={() => addToList(list.id)}
                    >
                      {addingToListId === list.id ? (
                        <>
                          <Spinner size="sm" animation="border" />
                          <span className="ms-1">Adding...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          <span>Add</span>
                        </>
                      )}
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        ) : (
          <Alert variant="secondary" className="text-center border-secondary">
            <p className="mb-3">
              {lists.length > 0
                ? 'Film ini sudah ada di semua list kamu.'
                : 'Kamu belum punya list apapun.'}
            </p>
            {lists.length === 0 && (
              <Button
                variant="danger"
                onClick={() => {
                  onClose();
                  navigate('/watchlist');
                }}
              >
                Buat List Baru
              </Button>
            )}
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-dark border-secondary justify-content-between">
        <Button variant="outline-secondary" size="sm" onClick={onClose}>
          Tutup
        </Button>
        {lists.length === 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onClose();
              navigate('/watchlist');
            }}
          >
            Buat List Pertama
          </Button>
        )}
      </Modal.Footer>
    </Modal>
    );
}
export default AddToListModal;