import React, { Component } from 'react';
import PropTypes from 'prop-types';
import openSocket from 'socket.io-client';
import { withRouter } from 'react-router-dom';
import { withCookies, Cookies } from 'react-cookie';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import Match from './components/Match';
import ParticipantEditor from './components/ParticipantEditor';
import LabelEditor from './components/LabelEditor';

const propTypes = {
  history: PropTypes.objectOf(PropTypes.any),
  cookies: PropTypes.instanceOf(Cookies).isRequired,
  match: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  history: null,
  match: null,
};

class Bracket extends Component {
  constructor(props) {
    super(props);
    const { cookies, match } = this.props;

    this.state = {
      loading: true,
    };

    if (cookies.get('user')) {
      this.state = {
        user: cookies.get('user'),
        loading: match.params.id != null,
        title: 'Load Bracket',
      };
      console.log(this.state.user);
    } else {
      this.props.history.push({ pathname: '/login' });
    }
  }

  componentDidMount() {
    const { match } = this.props;
    if (match.params.id != null) {
      this.verifyBracket(match.params.id);
    }
  }

  componentDidUpdate(prevProps) {
    const prevMatch = prevProps.match;
    const { match } = this.props;
    if (prevMatch.params.id !== match.params.id) {
      if (match.params.id != null) {
        this.verifyBracket(match.params.id);
      } else {
        this.resetBracket();
      }
    }
  }

  getLabels = (bracket, title) => {
    console.log(title);
    const apiURL = `https://teacup-challonge.herokuapp.com/labels?id=${bracket}`;
    fetch(apiURL, {
      method: 'get',
    })
      .then(
        (result) => {
          console.log('result returned.');
          result.json().then((data) => {
            console.log(data);
            this.setState({
              bracket,
              socket: openSocket(`https://teacup-challonge.herokuapp.com?id=${bracket}`),
              loading: false,
              labels: data,
              title,
            });
          });
        },
        () => {
          console.log('error');
        },
      );
  }

  addLabel = (label) => {
    const { labels } = this.state;
    labels[label.name] = label;
    this.setState({ labels });
  }

  updateLabelProperty = (id, e) => {
    const { labels } = this.state;
    if (id in labels) {
      const label = labels[id];
      if (e.target.name === 'type') {
        if (label.type === 'option_select' || e.target.value === 'option_select') {
          label.options = [];
        }
        label.type = e.target.value;
        label.default = '';
      } else if (e.target.name === 'options') {
        label.options = [];
        let foundDefault = false;
        e.target.value.forEach((option) => {
          label.options.push(option.value);
          if (option.value === label.default) {
            foundDefault = true;
          }
        });
        if (!foundDefault) {
          label.default = '';
          if (label.options.length > 0) {
            const d = label.options[0];
            label.default = d;
          }
        }
      } else if (e.target.name === 'default') {
        if (label.type === 'option_select') {
          let foundDefault = false;
          label.options.forEach((option) => {
            if (option === e.target.value) {
              foundDefault = true;
            }
          });
          if (foundDefault) {
            label.default = e.target.value;
          }
        } else {
          label.default = e.target.value;
        }
      }
      labels[id] = label;
      this.setState({
        labels,
      });
    }
  }

  updateBracket = (urlCode) => {
    const apiURL = `https://teacup-challonge.herokuapp.com/tournament?id=${urlCode}`;
    fetch(apiURL, {
      method: 'get',
    })
      .then(
        (result) => {
          console.log('result returned.');
          result.json().then((data) => {
            console.log(data);
            this.getLabels(
              urlCode,
              data.tournament.name,
            );
          });
        },
        () => {
          console.log('error');
        },
      );
  }

  loadBracket = (urlCode) => {
    const { history } = this.props;
    history.push({ pathname: `/bracket/${urlCode}` });
    this.setState({
      loading: true,
    });
  }

  resetBracket = () => {
    this.setState({
      bracket: null,
      labels: null,
      loading: false,
      title: 'Load Bracket',
    });
  }

  verifyBracket = (challongeURL) => {
    const { history } = this.props;
    const { user } = this.state;
    const username = user.user;
    const userKey = user.key;
    const apiURL = `https://teacup-challonge.herokuapp.com/init?user=${username}&key=${userKey}&id=${challongeURL}`;
    console.log(apiURL);
    fetch(apiURL, {
      method: 'get',
    })
      .then(
        (result) => {
          console.log('result returned.');
          result.json().then((data) => {
            console.log(data);
            if (data.isOwner) {
              this.updateBracket(challongeURL);
            } else {
              history.push({ pathname: '/bracket' });
            }
          });
        },
        () => {
          history.push({ pathname: '/bracket' });
        },
      );
  }

  render() {
    if (this.state.user != null && !this.state.loading) {
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <h3 className="page-title">{this.state.title}</h3>
            </Col>
          </Row>
          <Row>
            <Col md>
              <Card>
                <CardBody>
                  <div className="card__title">
                    <h5 className="bold-text">Current Match</h5>
                    <h5 className="subhead">Update stream match data live!</h5>
                  </div>
                  <Match
                    user={this.state.user}
                    bracket={this.state.bracket}
                    labels={this.state.labels}
                    socket={this.state.socket}
                    loadBracket={this.loadBracket}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md>
              <Card>
                <CardBody>
                  <div className="card__title">
                    <h5 className="bold-text">Labels</h5>
                    <h5 className="subhead">Add additional labels to participants.</h5>
                  </div>
                  <LabelEditor
                    bracket={this.state.bracket}
                    labels={this.state.labels}
                    updateLabelProperty={this.updateLabelProperty}
                    addLabel={this.addLabel}
                  />
                </CardBody>
              </Card>
            </Col>
            <Col md>
              <Card>
                <CardBody>
                  <div className="card__title">
                    <h5 className="bold-text">Participants</h5>
                    <h5 className="subhead">Add default values for participants.</h5>
                  </div>
                  <ParticipantEditor
                    bracket={this.state.bracket}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                <div className="card__title">
                  <h5 className="bold-text">Loading</h5>
                  <h5 className="subhead">One moment, please...</h5>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

Bracket.propTypes = propTypes;
Bracket.defaultProps = defaultProps;

export default withRouter(withCookies(Bracket));
