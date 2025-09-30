import { Button } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';

interface GridCardProps {
  cardsArray?: Array<{ title: string; description: string; buttonText: string; buttonLink: string }>;
}

function GridCard(cards: GridCardProps) {
  return (
    <Row xs={1} md={2} className="g-4">
      {cards.cardsArray ? (
        cards.cardsArray.map((card, idx) => (
          <Col key={idx}>
            <Card>
              <Card.Body>
                <Card.Title>{card.title}</Card.Title>
                <Card.Text>{card.description}</Card.Text>
                <Link to={card.buttonLink}>
                  <Button variant="primary">{card.buttonText}</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))
      ) : (
        // default cards if no props passed
        <>
          <Col key={1}>
            <Card>
              <Card.Body>
                <Card.Title>Card Title 1</Card.Title>
                <Card.Text>
                  Text 1
                </Card.Text>
                <Button variant="primary">Explore Tool</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col key={2}>
            <Card>
              <Card.Body>
                <Card.Title>Card Title 2</Card.Title>
                <Card.Text>
                  Text 2
                </Card.Text>
                <Button variant="primary">Explore Tool</Button>
              </Card.Body>
            </Card>
          </Col>
        </>
      )}
    </Row>
  );
}

export default GridCard;