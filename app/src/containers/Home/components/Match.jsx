import React, { PureComponent } from 'react';
import { Col, Row, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import Round from './Round';
import Participant from './Participant';
import ChallongeImportForm from './ImportForm';

const propTypes = {
  user: PropTypes.objectOf(PropTypes.any),
  bracket: PropTypes.string,
  labels: PropTypes.objectOf(PropTypes.any),
  currentMatch: PropTypes.objectOf(PropTypes.any),
  loadBracket: PropTypes.func,
  updateLabel: PropTypes.func,
  updateRound: PropTypes.func,
};

const defaultProps = {
  user: null,
  bracket: null,
  labels: null,
  currentMatch: null,
  loadBracket: null,
  updateLabel: null,
  updateRound: null,
};

class Match extends PureComponent {
  componentWillReceiveProps() {
    this.forceUpdate();
  }

  update = (e) => {
    const { bracket, currentMatch, user } = this.props;
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

  finish = (e) => {
    const { bracket, currentMatch, user } = this.props;
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
    const {
      user,
      bracket,
      labels,
      currentMatch,
      updateLabel,
      updateRound,
    } = this.props;
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
              updateRound={updateRound}
            />
            <Row>
              <Col>
                <Participant
                  participant={participant1}
                  id={participant1ID}
                  labels={labels}
                  updateLabel={updateLabel}
                />
              </Col>
              <Col>
                <Participant
                  participant={participant2}
                  id={participant2ID}
                  labels={labels}
                  updateLabel={updateLabel}
                />
              </Col>
            </Row>
            <div className="float-right">
              <Button
                type="submit"
                color="secondary"
                onClick={e => this.finish(e)}
              >
                Finish Set
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
      <ChallongeImportForm user={user} handleSubmit={this.props.loadBracket} />
    );
  }
}

Match.propTypes = propTypes;
Match.defaultProps = defaultProps;

export default Match;
