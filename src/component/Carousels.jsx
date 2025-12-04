// components/Carousels.jsx
import Carousel from 'react-bootstrap/Carousel';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Info, Play } from 'lucide-react';
import './componentStyle/CarouselStyle.css';
import { useNavigate } from 'react-router-dom';

function Carousels({ movies = [] }) {
  const navigate = useNavigate();

  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-secondary">Loading trending movies...</p>
      </div>
    );
  }

  return (
    <Carousel controls={true} indicators={true} pause="hover" className="custom-carousel">
      {movies.map((movie) => (
        <Carousel.Item key={movie.id} interval={5000}>
          <div 
            className="carousel-bg"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), 
                             url(https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '80vh',
              minHeight: '500px'
            }}
          />

          <Carousel.Caption className="h-100 d-flex align-items-center">
            <Container>
              <Row>
                <Col lg={6}>
                  <p className="text-cyan text-uppercase fw-bold small tracking-wider mb-2">
                    Trending Now
                  </p>
                  <h1 className="display-4 fw-bold text-white mb-3">
                    {movie.title}
                  </h1>
                  <p className="lead text-white-75 mb-4" style={{ maxWidth: '600px' }}>
                    {movie.overview?.slice(0, 180)}...
                  </p>

                  <div className="d-flex flex-wrap gap-3">
                    {/* <Button 
                      variant="danger" 
                      size="lg"
                      onClick={() => navigate(`/movie/${movie.id}`)}
                      className="d-flex align-items-center gap-2"
                    >
                      <Play size={20} fill="white" />
                      Detail Film
                    </Button> */}
                    <Button 
                      variant="outline-light" 
                      size="lg"
                      onClick={() => navigate(`/movie/${movie.id}`)}
                    >
                      <Info size={20} />
                      More Info
                    </Button>
                  </div>
                </Col>
              </Row>
            </Container>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default Carousels;