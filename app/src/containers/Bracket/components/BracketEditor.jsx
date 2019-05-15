import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import ImportForm from './ImportForm';
import MatchSelect from './MatchSelect';

const propTypes = {
  user: PropTypes.objectOf(PropTypes.any),
  bracket: PropTypes.string,
  loadBracket: PropTypes.func,
  socket: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  user: null,
  bracket: null,
  loadBracket: null,
  socket: null,
};

class BracketEditor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentMatch: {
        value: '',
        label: '',
      },
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
    socket.on('update', data => this.handleUpdate(data));
  }

  getCurrentMatch = (nextMatch) => {
    const { bracket } = this.props;
    const apiURL = `https://teacup-challonge.herokuapp.com/currentMatch?id=${bracket}`;
    fetch(apiURL, {
      method: 'get',
    })
      .then(
        (result) => {
          console.log('result returned.');
          result.json().then((data) => {
            console.log(data);
            if (data.match_id) {
              const participant1 = data.participants[data.participant1];
              const participant2 = data.participants[data.participant2];
              this.setState({
                currentMatch: {
                  label: `${participant1.name} vs ${participant2.name}`,
                  value: data.match_id,
                },
                nextMatch,
              });
            } else {
              this.setState({
                currentMatch: {
                  value: '',
                  label: '',
                },
                nextMatch: data.data.nextMatch,
              });
            }
            this.setUpSocket();
          });
        },
        () => {
          console.log('error');
        },
      );
  }

  handleUpdate = (data) => {
    this.setState({
      currentMatch: {
        value: data.currentMatch,
        label: `${data.participant1.name} vs ${data.participant2.name}`,
      },
      nextMatch: data.nextMatch,
    });
  }

  updateMatch = (e) => {
    this.setState({
      currentMatch: {
        value: e.target.value,
        label: e.target.label,
      },
    });
  }

  update = (e) => {
    const { bracket } = this.props;
    const { currentMatch, nextMatch } = this.state;
    e.preventDefault();
    let currentMatchID = currentMatch.value;
    if (currentMatchID === '') {
      currentMatchID = null;
    }
    const updateData = {
      id: bracket,
      current_match: currentMatchID,
      next_match: nextMatch,
    };
    console.log(updateData);
  }

  startService = () => {
    const { bracket, user } = this.props;
    const username = user.user;
    const userKey = user.key;
    const apiURL = `https://teacup-challonge.herokuapp.com/init?user=${username}&key=${userKey}&id=${bracket}`;
    fetch(apiURL, {
      method: 'get',
    })
      .then(
        (result) => {
          console.log('result returned.');
          result.json().then((data) => {
            console.log(data);
            if (data.isOwner) {
              if (data.data.currentMatch) {
                this.getCurrentMatch(data.data.nextMatch);
              } else {
                this.setState({
                  currentMatch: {
                    value: '',
                    label: '',
                  },
                  nextMatch: data.data.nextMatch,
                });
                this.setUpSocket();
              }
            }
          });
        },
        () => {
          console.log('error');
        },
      );
  }

  render() {
    const { bracket, user } = this.props;
    if (bracket != null) {
      return (
        <div>
          <form className="form">
            <div className="form__form-group">
              <span className="form__form-group-label">Current Match</span>
              <MatchSelect
                bracket={bracket}
                name="currentMatch"
                value={this.state.currentMatch}
                placeholder="Current Match"
                onChange={this.updateMatch}
              />
            </div>
          </form>
          <Button
            className="float-right"
            color="primary"
            type="submit"
            onClick={e => this.update(e)}
          >
            Update
          </Button>
        </div>
      );
    }
    return (
      <ImportForm user={user} handleSubmit={this.props.loadBracket} />
    );
  }
}

BracketEditor.propTypes = propTypes;
BracketEditor.defaultProps = defaultProps;

export default BracketEditor;
