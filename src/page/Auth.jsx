import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Nav, Alert } from 'react-bootstrap';
import './AuthStyle.css'

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Ganti dengan base URL backend kamu
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const res = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });

        // Simpan token dan user info
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Set default header untuk request selanjutnya
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Redirect ke home
        navigate('/', { replace: true });
      } else {
        // REGISTER
        const res = await axios.post(`${API_URL}/auth/register`, {
          name,
          email,
          password,
        });

        // Opsional: langsung login setelah register, atau minta login manual
        alert('Registrasi berhasil! Silakan login.');
        setIsLogin(true);
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      // Tangani error dari backend
      const message = err.response?.data?.message || err.message || 'Terjadi kesalahan';
      setError(message);

      // Jika register gagal karena email sudah ada, dll
      if (err.response?.status === 400 || err.response?.status === 401) {
        setError(err.response.data.message || 'Email atau password salah');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 bg-dark d-flex align-items-center justify-content-center p-4">
      <div className="w-100" style={{ maxWidth: '400px' }}>
        
        {/* Logo & Title */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '64px', height: '64px' }}>
            <img src="/IconWhite.png" alt="CineLog" className="w-100 h-100" />
          </div>
          <h1 className="mb-2">CineLog</h1>
          <p className="text-secondary">Temukan film-film trending dan favoritmu, serta kelola watchlist film dengan mudah</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Auth Card */}
        <Card className="bg-secondary bg-opacity-10 border-secondary border-opacity-50 p-4">
          <Card.Body>
            
            {/* Toggle Login / Register */}
            <Nav variant="pills" className="mb-4 justify-content-center gap-3">
              <Nav.Item className="flex-grow-1">
                <Button
                  onClick={() => { setIsLogin(true); setError(''); }}
                  variant={isLogin ? 'primary' : 'outline-secondary'}
                  className="w-100"
                  disabled={loading}
                >
                  Login
                </Button>
              </Nav.Item>
              <Nav.Item className="flex-grow-1">
                <Button
                  onClick={() => { setIsLogin(false); setError(''); }}
                  variant={!isLogin ? 'danger' : 'outline-secondary'}
                  className="w-100"
                  disabled={loading}
                >
                  Register
                </Button>
              </Nav.Item>
            </Nav>

            {/* Form */}
            <Form onSubmit={handleSubmit}>
              
              {/* Name - hanya muncul saat Register */}
              {!isLogin && (
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label className="text-light">Nama</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    disabled={loading}
                    className="bg-dark text-white border-secondary"
                    placeholder="Masukkan nama lengkap"
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label className="text-light">Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-dark text-white border-secondary"
                  placeholder="contoh@mail.com"
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formPassword">
                <Form.Label className="text-light">Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-dark text-white border-secondary"
                  placeholder="Minimal 6 karakter"
                />
              </Form.Group>

              <Button
                variant={isLogin ? "primary" : "danger"}
                type="submit"
                className="w-100 py-2"
                disabled={loading}
              >
                {loading ? (
                  <>Loading...</>
                ) : (
                  <>{isLogin ? 'Masuk' : 'Daftar'}</>
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default AuthPage;