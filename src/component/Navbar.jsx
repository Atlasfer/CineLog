import React from 'react';
import { Button, Image, Dropdown } from 'react-bootstrap';
import { Home, List, Heart, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './componentStyle/NavbarStyle.css'

function NavbarComponent({ user, handleLogout }) {
    const navigate = useNavigate();

    // Avatar URL
    const avatarUrl = user?.displayName || user?.username
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.username)}&background=dc3545&color=fff&bold=true&size=128`
        : null;

    return (
        <div>
            <Navbar expand="lg" sticky="top" className="bg-body-tertiary py-3 shadow-sm">
                <Container>
                    {/* Logo & Brand */}
                    <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <img src='/IconWhite.png' alt="CineLog" style={{ width: '32px', height: '32px' }} />
                        <Navbar.Brand className="NavBrand fw-bold mb-0">
                            CineLog
                        </Navbar.Brand>
                    </div>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    
                    <Navbar.Collapse id="basic-navbar-nav">
                        {/* Center Nav Links */}
                        <Nav className="mx-auto">
                            <Nav.Link onClick={() => navigate('/')} className="Linknav px-3">
                                Home
                            </Nav.Link>
                            {user && (
                                <>
                                    <Nav.Link onClick={() => navigate('/watchlist')} className="Linknav px-3">
                                        Watchlist
                                    </Nav.Link>
                                </>
                            )}
                        </Nav>

                        {/* Right Side: Avatar Dropdown or Login Button */}
                        <div className="d-none d-lg-flex align-items-center">
                            {user ? (
                                <Dropdown align="end">
                                    <Dropdown.Toggle 
                                        as="div" 
                                        className="d-flex align-items-center gap-2"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span className="text-white d-none d-xl-inline">
                                            {user.displayName || user.username}
                                        </span>
                                        <Image
                                            src={avatarUrl}
                                            roundedCircle
                                            width={42}
                                            height={42}
                                            className="border border-2 border-danger"
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="bg-dark border-secondary">
                                        <Dropdown.Item 
                                            onClick={() => navigate('/profile')}
                                            className="text-white d-flex align-items-center gap-2"
                                        >
                                            <User size={18} />
                                            Profile
                                        </Dropdown.Item>
                                        <Dropdown.Divider className="border-secondary" />
                                        <Dropdown.Item 
                                            onClick={handleLogout}
                                            className="text-danger d-flex align-items-center gap-2"
                                        >
                                            <LogOut size={18} />
                                            Logout
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            ) : (
                                <Button variant="danger" onClick={() => navigate('/auth')}>
                                    Login
                                </Button>
                            )}
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Mobile Bottom Navigation - Hanya muncul jika user sudah login */}
            {user && (
                <Navbar 
                    fixed="bottom" 
                    className="d-lg-none border-top border-secondary shadow-lg"
                    style={{ backgroundColor: '#1a1a1a' }}
                >
                    <Nav className="w-100 justify-content-around py-2">
                        <Nav.Link 
                            onClick={() => navigate('/')}
                            className="d-flex flex-column align-items-center text-white"
                        >
                            <Home size={24} />
                            <small className="mt-1" style={{ fontSize: '0.7rem' }}>Home</small>
                        </Nav.Link>
                        <Nav.Link 
                            onClick={() => navigate('/watchlist')}
                            className="d-flex flex-column align-items-center text-white"
                        >
                            <List size={24} />
                            <small className="mt-1" style={{ fontSize: '0.7rem' }}>Lists</small>
                        </Nav.Link>
                        <Nav.Link 
                            onClick={() => navigate('/profile')}
                            className="d-flex flex-column align-items-center text-white"
                        >
                            <User size={24} />
                            <small className="mt-1" style={{ fontSize: '0.7rem' }}>Profile</small>
                        </Nav.Link>
                    </Nav>
                </Navbar>
            )}
        </div>
    );
}

export default NavbarComponent;