import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import DesktopClientCard from './components/DesktopClientCard';
import ChromeExtensionCard from './components/ChromeExtensionCard';

const Download = () => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Downloads</h3>
      </Col>
    </Row>
    <Row>
      <DesktopClientCard />
    </Row>
    <Row>
      <ChromeExtensionCard />
    </Row>
  </Container>
);

export default Download;
