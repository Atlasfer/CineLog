import { useState } from 'react';
import api from '../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Form, Button, Nav, Alert } from 'react-bootstrap';
import './AuthStyle.css'

function AuthPage({ setUser, setAppData }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const res = await api.post('/auth/login', { username, password });

        // Simpan token dan user info
        const { token, id, displayName: userName } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ id, username, displayName: userName }));

        setUser({ id, username, displayName: userName });

        // Load user data
        const [lists, quotes] = await Promise.all([
          api.get('/lists').catch(() => ({ data: { data: [] } })),
          api.get('/quotes').catch(() => ({ data: { data: [] } }))
        ]);

        setAppData({
          customLists: lists.data.data || lists.data || [],
          ratings: [],
          quotes: quotes.data.data || quotes.data || []
        });

        navigate(from, { replace: true });
      } else {
        // REGISTER
        await api.post('/auth/register', {
          username,
          password,
          displayName: displayName || username
        });

        alert('Registrasi berhasil! Silakan login.');
        setIsLogin(true);
        setDisplayName('');
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Terjadi kesalahan';
      setError(message);
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
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        {/* Auth Card */}
        <Card className="bg-secondary bg-opacity-10 border-secondary border-opacity-50 p-4">
          <Card.Body>
            
            {/* Toggle Login / Register */}
            <Nav variant="pills" className="mb-4 justify-content-center gap-3">
              <Nav.Item className="flex-grow-1">
                <Button
                  onClick={() => { setIsLogin(true); setError(''); }}
                  variant={isLogin ? 'info' : 'outline-secondary'}
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
              
              {/* Name hanya muncul saat Register */}
              {!isLogin && (
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label className="text-light">Display Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={loading}
                    className="bg-dark text-white border-secondary"
                    placeholder="Masukkan display name"
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label className="text-light">Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-dark text-white border-secondary"
                  placeholder="bapake"
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
                variant={isLogin ? "info" : "danger"}
                type="submit"
                className="w-100 py-2"
                disabled={loading}
              >
                {loading ? 'Loading...' : (isLogin ? 'Masuk' : 'Daftar')}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default AuthPage;