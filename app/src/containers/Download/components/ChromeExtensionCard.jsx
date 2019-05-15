import React from 'react';
import { Card, CardBody, Col } from 'reactstrap';

const ChromeExtensionCard = () => (
  <Col md={12}>
    <Card>
      <CardBody>
        <div className="card__title">
          <h5 className="bold-text">Chrome Extension for Challonge</h5>
          <h5 className="subhead">Queue matches to be streamed right from the bracket page.</h5>
        </div>
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://chrome.google.com/webstore/detail/teacup/noccoohlmcmckbplaggkfobjlipcbjfe"
          >
            Install Extension
          </a>
        </p>
      </CardBody>
    </Card>
  </Col>
);

export default ChromeExtensionCard;
