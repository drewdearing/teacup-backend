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
            href="https://firebasestorage.googleapis.com/v0/b/teacup-challonge.appspot.com/o/teaCup-windows.zip?alt=media&token=fe1c1483-34d5-4dd5-a436-63a60ebba884"
          >
            Windows Download
          </a>
        </p>
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://firebasestorage.googleapis.com/v0/b/teacup-challonge.appspot.com/o/teaCup-mac.zip?alt=media&token=0731ddac-3322-4c2b-a21b-cc2ae3e89b9d"
          >
            Mac Download
          </a>
        </p>
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://firebasestorage.googleapis.com/v0/b/teacup-challonge.appspot.com/o/teaCup-linux.zip?alt=media&token=3b9e1500-c7c9-4d5e-aaa0-06b399b5fe3d"
          >
            Linux Download
          </a>
        </p>
      </CardBody>
    </Card>
  </Col>
);

export default DesktopClientCard;
