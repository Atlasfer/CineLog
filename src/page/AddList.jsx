import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Modal, Button, ListGroup, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

function AddToListModal({ show, movieId, onClose, onListAdded }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToListId, setAddingToListId] = useState(null); // untuk loading per item

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch semua list user saat modal dibuka
  useEffect(() => {
    fetchUserLists();
  }, []);

  const fetchUserLists = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/lists`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLists(res.data.lists || res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired / not logged in
        onClose();
        window.location.href = '/auth';
        return;
      }
      setError('Gagal memuat daftar');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tambah film ke list
  const addToList = async (listId) => {
    if (!movieId) return;

    setAddingToListId(listId);
    try {
      await axios.post(
        `${API_URL}/lists/${listId}/movies`,
        { movieId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Beri feedback ke parent jika perlu (misal refresh detail page)
      if (onListAdded) onListAdded();

      // Tutup modal setelah sukses
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan ke list');
    } finally {
      setAddingToListId(null);
    }
  };

  // Filter list yang belum punya film ini
  const availableLists = movieId
    ? lists.filter(list => !list.movieIds?.includes(movieId))
    : lists;

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
          <ListGroup className="border-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {availableLists.map(list => (
              <ListGroup.Item
                key={list.id}
                className="bg-secondary bg-opacity-10 border-secondary border-opacity-50 mb-2 rounded"
                style={{ cursor: 'pointer' }}
                onClick={() => addToList(list.id)}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-1">{list.name}</h6>
                    {list.description && (
                      <p className="text-secondary small mb-1">{list.description}</p>
                    )}
                    <small className="text-muted">
                      {list.movieIds?.length || 0} film
                    </small>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={addingToListId === list.id}
                    className="d-flex align-items-center gap-1"
                  >
                    {addingToListId === list.id ? (
                      <>
                        <Spinner size="sm" animation="border" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
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