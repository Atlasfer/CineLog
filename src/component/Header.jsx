import React from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { List, ArrowRight } from 'lucide-react';
import './componentStyle/HeaderStyle.css';

function Header({ onNavigateToWatchlist }) {
  const heroImageUrl = 'BgHeader.png'; 
  const handleScrollToTrending = () => {
    document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section" style={{ backgroundImage: `url(${heroImageUrl})` }}>
        <div className="hero-overlay" />
        <Container className="h-100 position-relative">
          <Row className="h-100 align-items-center justify-content-center text-center">
            <Col lg={7} md={9}> 
              <h3 className="hero-title mb-4">
                Temukan Dunia Film dengan <span className="text-cyan">CineLog</span>
              </h3>
              <p className="hero-description mb-5">
                Temukan film-film trending dan favoritmu, serta kelola watchlist film dengan mudah. Jelajahi ribuan film dari berbagai genre dan era.
              </p>

              {/* Tombol Aksi */}
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                {/* Tombol Utama: Watchlist */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onNavigateToWatchlist}
                  className="btn-watchlist"
                >
                  <List className="me-2" />
                  Lihat Watchlist Saya
                </Button>
                {/* Tombol Jelajahi */}
                <Button
                  variant="outline-light"
                  size="lg"
                  onClick={handleScrollToTrending}
                >
                  Jelajahi Film Trending
                  <ArrowRight className="ms-2" />
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
    </section>
  );
}

export default Header;