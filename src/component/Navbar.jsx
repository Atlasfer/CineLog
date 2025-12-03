import React from 'react';
import { Button, Image } from 'react-bootstrap';
import { Home, List, Heart, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './componentStyle/NavbarStyle.css'

// Anggap 'api' diimpor di App.jsx dan diteruskan
// atau diimpor di sini (kita anggap props diperlukan untuk logout)
// import api from '../lib/api'; 

// Component ini menerima semua data dan handler yang dibutuhkan
function NavbarComponent({ user, setUser, setAppData, handleLogout }) {
    const navigate = useNavigate();

    return (
        <>
            {/* NAVBAR UTAMA (Desktop) */}
            <Navbar expand="lg" sticky="top" className="bg-body-tertiary py-3">
                <Container>
                    <img src='IconWhite.png'></img>
                    <Navbar.Brand onClick={() => navigate('/')} className="NavBrand fw-bold">
                        CineLog
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                      <Nav className="mx-auto">
                          <Nav.Link onClick={() => navigate('/')} className="Linknav">
                              <Home size={20} className="me-1" /> Home
                          </Nav.Link>
                          <Nav.Link onClick={() => navigate('/watchlist')} className="Linknav">
                              Watchlist
                          </Nav.Link>
                          <Nav.Link onClick={() => navigate('/favorit')} className="Linknav">
                              Favorites
                          </Nav.Link>
                      </Nav>
                    </Navbar.Collapse>

                    {/* Right Side: Avatar or Login */}
                    {user ? (
                        <div className="d-flex align-items-center gap-3">
                            <Button variant="link" className="p-0" onClick={() => navigate('/profile')}>
                                <Image
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                    roundedCircle
                                    width={42}
                                    height={42}
                                    className="border border-2 border-danger"
                                />
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                                <LogOut size={18} />
                            </Button>
                        </div>
                    ) : (
                        <Button variant="danger" onClick={() => navigate('/auth')}>
                            Login
                        </Button>
                    )}
                </Container>
            </Navbar>

            {/* Mobile Bottom Navigation */}
            {user && (
                <Navbar fixed="bottom" bg="dark" variant="dark" className="d-lg-none border-top border-secondary">
                    <Nav className="w-100 justify-content-around py-2">
                        <Nav.Link onClick={() => navigate('/')}><Home size={28} /></Nav.Link>
                        <Nav.Link onClick={() => navigate('/watchlist')}><List size={28} /></Nav.Link>
                        <Nav.Link onClick={() => navigate('/favorit')}><Heart size={28} /></Nav.Link>
                        <Nav.Link onClick={() => navigate('/profile')}><User size={28} /></Nav.Link>
                    </Nav>
                </Navbar>
            )}
        </>
    );
}
export default NavbarComponent;