import React, { PureComponent } from 'react';
import { Col, Row, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import Round from './Round';
import Participant from './Participant';
import ImportForm from './ImportForm';

const propTypes = {
  user: PropTypes.objectOf(PropTypes.any),
  bracket: PropTypes.string,
  labels: PropTypes.objectOf(PropTypes.any),
  socket: PropTypes.objectOf(PropTypes.any),
  loadBracket: PropTypes.func,
};

const defaultProps = {
  user: null,
  bracket: null,
  labels: null,
  socket: null,
  loadBracket: null,
};

class Match extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentMatch: null,
    };
  }
  componentDidMount() {
    const { bracket } = this.props;
    if (bracket != null) {
      this.startService();
    }
  }

  componentDidUpdate(prevProps) {
    const prevBracket = prevProps.bracket;
    const { bracket } = this.props;
    if (prevBracket !== bracket) {
      this.startService();
    }
  }

  setUpSocket = () => {
    const { socket } = this.props;
    socket.on('current_labels', data => this.handleLabelUpdate(data));
  }

  startService = () => {
    const { bracket } = this.props;
    const apiURL = `https://teacup-challonge.herokuapp.com/currentMatch?id=${bracket}`;
    fetch(apiURL, {
      method: 'get',
    })
      .then(
        (result) => {
          console.log('result returned.');
          result.json().then((data) => {
            this.setState({
              currentMatch: data,
            });
            this.setUpSocket();
          }).catch((err) => {
            console.log(err);
          });
        },
        () => {
          console.log('error');
        },
      );
  }

  handleLabelUpdate = (data) => {
    const { currentMatch } = this.state;
    if ('match_id' in data) {
      currentMatch.match_id = data.match_id;
    }
    if ('round' in data) {
      currentMatch.round = data.round;
    }
    if ('participants' in data) {
      Object.keys(data.participants).forEach((id) => {
        if (!('participants' in currentMatch)) {
          currentMatch.participants = {};
        }
        if (id in currentMatch.participants) {
          Object.keys(data.participants[id]).forEach((label) => {
            currentMatch.participants[id][label] = data.participants[id][label];
          });
        } else {
          currentMatch.participants[id] = data.participants[id];
        }
      });
    }
    if ('participant1' in data && 'participant2' in data) {
      currentMatch.participant1 = data.participant1;
      currentMatch.participant2 = data.participant2;
    }
    this.setState({ currentMatch }, () => {
      this.forceUpdate();
    });
  }

  updateLabel = (id, e) => {
    const { currentMatch } = this.state;
    if ('participants' in currentMatch) {
      if (id in currentMatch.participants) {
        const participant = currentMatch.participants[id];
        participant[e.target.name] = e.target.value;
        currentMatch.participants[id] = participant;
        this.setState({ currentMatch }, () => {
          this.forceUpdate();
        });
      }
    }
  }

  updateRound = (e) => {
    const { currentMatch } = this.state;
    currentMatch.round = e.target.value;
    this.setState({ currentMatch }, () => {
      this.forceUpdate();
    });
  }

  update = (e) => {
    const { bracket, user } = this.props;
    const { currentMatch } = this.state;
    e.preventDefault();
    currentMatch.id = bracket;
    const apiURL = 'https://teacup-challonge.herokuapp.com/match/update';
    const apiURL2 = 'https://teacup-challonge.herokuapp.com/match/update/score';
    currentMatch.id = bracket;
    currentMatch.user = user.user;
    currentMatch.key = user.key;
    fetch(apiURL, {
      method: 'put',
      body: JSON.stringify(currentMatch),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(
        (result) => {
          console.log(result);
        },
        () => {
          console.log('error');
        },
      );
    fetch(apiURL2, {
      method: 'put',
      body: JSON.stringify(currentMatch),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(
        (result) => {
          console.log(result);
        },
        () => {
          console.log('error');
        },
      );
  }

  flip = (e) => {
    const { currentMatch } = this.state;
    e.preventDefault();
    const p2ID = currentMatch.participant1;
    const p1ID = currentMatch.participant2;
    currentMatch.participant1 = p1ID;
    currentMatch.participant2 = p2ID;
    this.setState({ currentMatch }, () => {
      this.forceUpdate();
      this.update(e);
    });
  }

  finish = (e) => {
    const { bracket, user } = this.props;
    const { currentMatch } = this.state;
    e.preventDefault();
    currentMatch.id = bracket;
    const apiURL = 'https://teacup-challonge.herokuapp.com/match/complete';
    currentMatch.id = bracket;
    currentMatch.user = user.user;
    currentMatch.key = user.key;
    fetch(apiURL, {
      method: 'put',
      body: JSON.stringify(currentMatch),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(
        (result) => {
          console.log(result);
        },
        () => {
          console.log('error');
        },
      );
  }

  render() {
    const { bracket, user, labels } = this.props;
    const { currentMatch } = this.state;
    if (bracket != null && labels != null) {
      if (currentMatch != null && currentMatch.match_id != null) {
        const participant1ID = currentMatch.participant1;
        const participant2ID = currentMatch.participant2;
        const participant1 = currentMatch.participants[participant1ID];
        const participant2 = currentMatch.participants[participant2ID];
        return (
          <div>
            <Round
              round={currentMatch.round}
              updateRound={this.updateRound}
            />
            <Row>
              <Col>
                <Participant
                  participant={participant1}
                  id={participant1ID}
                  labels={labels}
                  updateLabel={this.updateLabel}
                />
              </Col>
              <Col>
                <Participant
                  participant={participant2}
                  id={participant2ID}
                  labels={labels}
                  updateLabel={this.updateLabel}
                />
              </Col>
            </Row>
            <div className="float-right">
              <Button
                type="submit"
                color="danger"
                onClick={e => this.finish(e)}
              >
                Finish Set
              </Button>
              <Button
                type="submit"
                color="secondary"
                onClick={e => this.flip(e)}
              >
                Flip Players
              </Button>
              <Button
                color="primary"
                type="submit"
                onClick={e => this.update(e)}
              >
                Update
              </Button>
            </div>
          </div>
        );
      }
      return (
        <p>Waiting on match.</p>
      );
    }
    return (
      <ImportForm user={user} handleSubmit={this.props.loadBracket} />
    );
  }
}

Match.propTypes = propTypes;
Match.defaultProps = defaultProps;

export default Match;
