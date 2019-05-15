import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import ParticipantSelect from './ParticipantSelect';
import Participant from './Participant';


const propTypes = {
  bracket: PropTypes.string,
};

const defaultProps = {
  bracket: null,
};

class ParticipantEditor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selected: {
        label: '',
        value: '',
      },
      participant: null,
      labels: null,
    };
  }

  componentWillReceiveProps() {
    this.forceUpdate();
  }

  setLabels = (data) => {
    const participant = {};
    Object.keys(data).forEach((label) => {
      const labelValue = data[label].value;
      if (labelValue != null && labelValue !== '') {
        participant[label] = data[label].value;
      } else {
        participant[label] = data[label].default;
      }
    });
    this.setState({
      labels: data,
      participant,
    });
  }

  updateParticipant = (e) => {
    const { bracket } = this.props;
    this.setState({
      selected: {
        label: e.target.label,
        value: String(e.target.value),
      },
      labels: null,
      participant: null,
    });
    let apiURL = 'https://teacup-challonge.herokuapp.com';
    apiURL += `/participant/labels?id=${bracket}&participant_id=${e.target.value}`;
    fetch(apiURL, {
      method: 'get',
    })
      .then(
        (result) => {
          console.log('result returned.');
          result.json().then((data) => {
            this.setLabels(data);
          });
        },
        () => {
          console.log('error');
        },
      );
  }

  updateLabel = (id, e) => {
    const { participant } = this.state;
    if (participant != null) {
      const newParticipant = participant;
      newParticipant[e.target.name] = e.target.value;
      console.log(participant);
      this.setState({
        participant: newParticipant,
      }, () => {
        this.forceUpdate();
      });
    }
  }

  update = (e) => {
    const { bracket } = this.props;
    const { selected, participant } = this.state;
    e.preventDefault();
    if (selected.value != null && selected.value !== '') {
      const participantID = selected.value;
      const updateData = {
        id: bracket,
        participant_id: participantID,
        labels: participant,
      };
      const apiURL = 'https://teacup-challonge.herokuapp.com/participant/labels/update';
      fetch(apiURL, {
        method: 'put',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          () => {
            console.log('result returned.');
          },
          () => {
            console.log('error');
          },
        );
    }
  }

  showParticipant = () => {
    const { selected, participant, labels } = this.state;
    if (selected != null && selected.value !== '') {
      if (participant != null && labels != null) {
        return (
          <div>
            <Participant
              participant={participant}
              labels={labels}
              id={participant.value}
              updateLabel={this.updateLabel}
            />
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
        <p>Loading participant...</p>
      );
    }
    return (
      <p>Select a participant.</p>
    );
  }

  render() {
    const { bracket } = this.props;
    if (bracket != null) {
      return (
        <div>
          <form className="form">
            <div className="form__form-group">
              <span className="form__form-group-label">Participant</span>
              <ParticipantSelect
                bracket={bracket}
                name="selectedParticipant"
                value={this.state.selected}
                placeholder="Participant Name"
                onChange={this.updateParticipant}
              />
            </div>
          </form>
          {this.showParticipant()}
        </div>
      );
    }
    return (
      <p>Waiting on bracket.</p>
    );
  }
}

ParticipantEditor.propTypes = propTypes;
ParticipantEditor.defaultProps = defaultProps;

export default ParticipantEditor;
