import React, { PureComponent } from 'react';
import AsyncSelect from 'react-select/lib/Async';
import PropTypes from 'prop-types';

class ParticipantSelect extends PureComponent {
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
    const apiURL = `https://teacup-challonge.herokuapp.com/participants?id=${bracket}`;
    fetch(apiURL, {
      method: 'get',
    })
      .then(
        (result) => {
          console.log('result returned.');
          result.json().then((data) => {
            this.filterOptions(data, inputValue, callback);
          });
        },
        () => {
          console.log('error');
        },
      );
  }

  filterOptions = (data, inputValue, callback) => {
    const filteredOptions = [];
    const options = [];
    data.forEach((participantObj) => {
      if ('participant' in participantObj) {
        const { participant } = participantObj;
        const { id } = participant;
        const displayName = participant.display_name;
        if (displayName.toLowerCase().includes(inputValue.toLowerCase())) {
          filteredOptions.push({
            value: id,
            label: displayName,
          });
        }
        options.push({
          value: id,
          label: displayName,
        });
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

export default ParticipantSelect;
