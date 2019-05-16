import React from 'react';
import { Card, CardBody, Col } from 'reactstrap';

const DesktopClientCard = () => (
  <Col md={12}>
    <Card>
      <CardBody>
        <div className="card__title">
          <h5 className="bold-text">teaCup Desktop Client</h5>
          <h5 className="subhead">Sync text files and images with current labels.</h5>
        </div>
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://bit.ly/2WOpjXW"
          >
            Windows Download
          </a>
        </p>
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://bit.ly/2WbuX9q"
          >
            Mac Download
          </a>
        </p>
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://bit.ly/2VJkdzG"
          >
            Linux Download
          </a>
        </p>
      </CardBody>
    </Card>
  </Col>
);

export default DesktopClientCard;
