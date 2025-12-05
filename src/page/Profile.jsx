import React, { useState, useEffect } from 'react';
import { Save, LogOut, Trash2 } from 'lucide-react';
import { Container, Card, Row, Col, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

function Profile({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.username || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setMessage({ text: 'Display name tidak boleh kosong', type: 'danger' });
      return;
    }

    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.put('/auth/update-display', {
        newDisplayName: displayName
      });

      // Update user state
      const updatedUser = {
        ...user,
        displayName: res.data.displayName
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setIsEditing(false);
      setMessage({ text: 'Profil berhasil diperbarui!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Gagal menyimpan perubahan',
        type: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.displayName || user?.username || '');
    setIsEditing(false);
    setMessage({ text: '', type: '' });
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/delete-account');
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      alert('Akun berhasil dihapus. Anda akan dialihkan ke halaman utama.');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus akun');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    }
  };

  // Avatar dengan initial
  const avatarUrl = user?.displayName || user?.username
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.username)}&background=dc3545&color=fff&bold=true&size=180`
    : '/default-avatar.png';

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: '900px' }}>
      <h2 className="text-white mb-4">Profil Saya</h2>

      {message.text && (
        <Alert 
          variant={message.type} 
          dismissible 
          onClose={() => setMessage({ text: '', type: '' })}
        >
          {message.text}
        </Alert>
      )}

      <Card className="bg-dark border border-secondary shadow-lg">
        <Card.Body className="p-4 p-md-5">
          <Row className="g-5 align-items-start">
            {/* Avatar */}
            <Col md={4} className="text-center">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="rounded-circle border border-4 border-secondary shadow"
                style={{ width: '180px', height: '180px', objectFit: 'cover' }}
              />
              <p className="text-secondary small mt-3">
                Foto profil menggunakan inisial nama
              </p>
            </Col>

            {/* Form atau Info */}
            <Col md={8}>
              {isEditing ? (
                <Form>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-light fw-bold">Display Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-secondary text-white border-secondary"
                      placeholder="Masukkan nama tampilan"
                    />
                    <Form.Text className="text-muted">
                      Nama ini akan ditampilkan di profil Anda
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="text-light fw-bold">Username</Form.Label>
                    <Form.Control
                      type="text"
                      value={user?.username || ''}
                      disabled
                      className="bg-secondary text-white opacity-75 border-secondary"
                    />
                    <Form.Text className="text-muted">Username tidak dapat diubah</Form.Text>
                  </Form.Group>

                  <div className="d-flex gap-3">
                    <Button
                      onClick={handleSave}
                      variant="danger"
                      disabled={saving}
                      className="d-flex align-items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" animation="border" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Simpan
                        </>
                      )}
                    </Button>
                    <Button variant="outline-secondary" onClick={handleCancel}>
                      Batal
                    </Button>
                  </div>
                </Form>
              ) : (
                <div>
                  <div className="mb-4">
                    <p className="text-secondary small text-uppercase mb-1">Display Name</p>
                    <h3 className="text-white">{user?.displayName || 'Belum diisi'}</h3>
                  </div>

                  <div className="mb-5">
                    <p className="text-secondary small text-uppercase mb-1">Username</p>
                    <p className="text-white fs-5">{user?.username}</p>
                  </div>

                  <div className="d-flex flex-wrap gap-3">
                    <Button onClick={() => setIsEditing(true)} variant="danger" size="lg">
                      Edit Profil
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline-secondary"
                      className="d-flex align-items-center gap-2"
                    >
                      <LogOut size={20} />
                      Keluar
                    </Button>
                  </div>

                  {/* Danger Zone */}
                  <div className="mt-5 pt-4 border-top border-danger border-opacity-25">
                    <h5 className="text-danger mb-3">Danger Zone</h5>
                    <p className="text-secondary mb-3">
                      Menghapus akun akan menghapus semua data Anda termasuk list, rating, dan quotes.
                      Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <Button
                      variant="outline-danger"
                      onClick={() => setShowDeleteModal(true)}
                      className="d-flex align-items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Hapus Akun
                    </Button>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>Konfirmasi Hapus Akun</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <Alert variant="danger">
            <Alert.Heading>Peringatan!</Alert.Heading>
            <p>
              Tindakan ini akan menghapus akun Anda secara permanen beserta:
            </p>
            <ul>
              <li>Semua list yang Anda buat</li>
              <li>Semua rating yang Anda berikan</li>
              <li>Semua quotes yang Anda simpan</li>
            </ul>
            <p className="mb-0">
              <strong>Tindakan ini TIDAK dapat dibatalkan!</strong>
            </p>
          </Alert>
          <p className="text-white">Apakah Anda yakin ingin menghapus akun?</p>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Ya, Hapus Akun Saya
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Profile;