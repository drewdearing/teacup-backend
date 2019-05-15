import React, { PureComponent } from 'react';
import AsyncSelect from 'react-select/lib/Async';
import PropTypes from 'prop-types';

class MatchSelect extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    bracket: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string,
      }),
    ]).isRequired,
  };

  static defaultProps = {
    placeholder: '',
  };

  getParticipants = (data, inputValue, callback) => {
    const { bracket } = this.props;
    const apiURL = `https://teacup-challonge.herokuapp.com/participants?id=${bracket}`;
    fetch(apiURL, {
      method: 'get',
    })
      .then(
        (result) => {
          console.log('result returned.');
          result.json().then((participantData) => {
            const participants = {};
            participantData.forEach((participantObj) => {
              const { participant } = participantObj;
              participants[participant.id] = participant.display_name;
            });
            this.filterOptions(participants, data, inputValue, callback);
          });
        },
        () => {
          console.log('error');
        },
      );
  }

  handleChange = (selectedOption) => {
    const { name, onChange } = this.props;
    onChange({
      target: {
        name,
        value: selectedOption.value,
        label: selectedOption.label,
      },
    });
  };

  loadOptions = (inputValue, callback) => {
    const { bracket } = this.props;
    const apiURL = `https://teacup-challonge.herokuapp.com/matches?id=${bracket}`;
    fetch(apiURL, {
      method: 'get',
    })
      .then(
        (result) => {
          console.log('result returned.');
          result.json().then((data) => {
            this.getParticipants(data, inputValue, callback);
          });
        },
        () => {
          console.log('error');
        },
      );
  }

  filterOptions = (participants, data, inputValue, callback) => {
    const filteredOptions = [];
    data.forEach((matchObj) => {
      if ('match' in matchObj) {
        const { match } = matchObj;
        const { id } = match;
        const name = `${participants[match.player1_id]} vs ${participants[match.player2_id]}`;
        if (match.state === 'open' && name.toLowerCase().includes(inputValue.toLowerCase())) {
          filteredOptions.push({
            value: id,
            label: name,
          });
        }
      }
    });
    console.log(filteredOptions);
    callback(filteredOptions);
  }

  render() {
    const {
      value, name, placeholder,
    } = this.props;
    const clearable = false;
    const loadOptions = true;
    return (
      <AsyncSelect
        name={name}
        value={value}
        onChange={this.handleChange}
        loadOptions={this.loadOptions}
        clearable={clearable}
        className="react-select"
        placeholder={placeholder}
        classNamePrefix="react-select"
        defaultOptions={loadOptions}
      />
    );
  }
}

export default MatchSelect;
