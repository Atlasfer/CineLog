import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { NavLink } from 'react-router-dom';
import './NavbarStyle.css'

function NavbarComponent() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary py-3">
      <Container>
        <img src='MovieTrack.png'></img>
        <Navbar.Brand as = {NavLink} to="/" className='NavBrand fw-bold'>CineLog</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link as = {NavLink} to="/" className='Linknav'>Home</Nav.Link>
            <Nav.Link as = {NavLink} to="/profile" className='Linknav'>Profile</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;