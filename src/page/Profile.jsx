import React, { useState, useEffect } from 'react';
import { Save, LogOut } from 'lucide-react';
import { Container, Card, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Ambil data profil saat komponen mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const res = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = res.data.user || res.data;
      setUser(userData);
      setName(userData.name || '');
      setBio(userData.bio || '');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
      } else {
        setMessage({ text: 'Gagal memuat profil', type: 'danger' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Simpan perubahan (hanya name & bio)
  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await axios.put(
        `${API_URL}/user/profile`,
        { name, bio },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setUser(res.data.user);
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
    setName(user?.name || '');
    setBio(user?.bio || '');
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/auth');
    }
  };

  // Avatar default (bisa pakai initial huruf atau icon)
  const defaultAvatar = user?.name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=dc3545&color=fff&bold=true&size=180`
    : '/default-avatar.png';

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
        <p className="text-secondary mt-3">Memuat profil...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: '900px' }}>
      <h2 className="text-white mb-4">Profil Saya</h2>

      {message.text && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({ text: '', type: '' })}>
          {message.text}
        </Alert>
      )}

      <Card className="bg-dark border border-secondary shadow-lg">
        <Card.Body className="p-4 p-md-5">
          <Row className="g-5 align-items-start">
            {/* Avatar (tanpa upload) */}
            <Col md={4} className="text-center">
              <img
                src={defaultAvatar}
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
                    <Form.Label className="text-light fw-bold">Nama</Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-secondary text-white border-secondary"
                      placeholder="Masukkan nama kamu"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="text-light fw-bold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-secondary text-white opacity-75"
                    />
                    <Form.Text className="text-muted">Email tidak dapat diubah</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="text-light fw-bold">Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Ceritakan tentang dirimu, genre film favorit, atau mood hari ini..."
                      className="bg-secondary text-white border-secondary resize-none"
                    />
                  </Form.Group>

                  <div className="d-flex gap-3">
                    <Button
                      onClick={handleSave}
                      variant="danger"
                      disabled={saving}
                      className="d-flex align-items-center gap-2"
                    >
                      {saving ? <Spinner size="sm" animation="border" /> : <Save size={20} />}
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                    <Button variant="outline-secondary" onClick={handleCancel}>
                      Batal
                    </Button>
                  </div>
                </Form>
              ) : (
                <div>
                  <div className="mb-4">
                    <p className="text-secondary small text-uppercase mb-1">Nama</p>
                    <h3 className="text-white">{user?.name || 'Belum diisi'}</h3>
                  </div>

                  <div className="mb-4">
                    <p className="text-secondary small text-uppercase mb-1">Email</p>
                    <p className="text-white fs-5">{user?.email}</p>
                  </div>

                  <div className="mb-5">
                    <p className="text-secondary small text-uppercase mb-2">Bio</p>
                    <p className="text-white fst-italic lh-lg">
                      {user?.bio || 'Belum ada bio. Klik "Edit Profil" untuk menambahkan.'}
                    </p>
                  </div>

                  <div className="d-flex gap-3">
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
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}
export default Profile;