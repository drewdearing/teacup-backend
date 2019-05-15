import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import SelectField from '../../../shared/components/form/Select';

const propTypes = {
  participant: PropTypes.objectOf(PropTypes.any),
  labels: PropTypes.objectOf(PropTypes.any),
  updateLabel: PropTypes.func,
  id: PropTypes.string,
};

const defaultProps = {
  participant: null,
  labels: null,
  updateLabel: null,
  id: null,
};

class Participant extends PureComponent {
  componentWillReceiveProps() {
    this.forceUpdate();
  }

  onChange = (e) => {
    const { id, updateLabel } = this.props;
    updateLabel(id, e);
  }

  getLabel = (label) => {
    const { participant } = this.props;
    if (label.type === 'string') {
      return (
        <div className="form__form-group">
          <span className="form__form-group-label">{label.name}</span>
          <div className="form__form-group-field">
            <input
              name={label.name}
              type="text"
              value={participant[label.name]}
              placeholder={label.name}
              onChange={e => this.onChange(e)}
            />
          </div>
        </div>
      );
    } else if (label.type === 'int') {
      return (
        <div className="form__form-group">
          <span className="form__form-group-label">{label.name}</span>
          <div className="form__form-group-field">
            <input
              name={label.name}
              type="number"
              value={participant[label.name]}
              onChange={e => this.onChange(e)}
            />
          </div>
        </div>
      );
    } else if (label.type === 'option_select') {
      const options = [];
      const selectedItem = {
        label: participant[label.name],
        value: participant[label.name],
      };
      label.options.forEach((option) => {
        options.push({
          label: option,
          value: option,
        });
      });
      return (
        <div className="form__form-group">
          <span className="form__form-group-label">{label.name}</span>
          <SelectField
            options={options}
            value={selectedItem}
            name={label.name}
            placeholder={label.name}
            onChange={this.onChange}
          />
        </div>
      );
    }
    return (
      <br />
    );
  }

  showLabels = () => {
    const { labels } = this.props;
    const labelList = [];
    if (Object.keys(labels).length > 0) {
      Object.values(labels).forEach((label) => {
        labelList.push(this.getLabel(label));
      });
      return (labelList);
    }
    return (<p>Add labels to this bracket to edit participant data.</p>);
  }

  render() {
    const { participant } = this.props;
    return (
      <div>
        <h3>{participant.name}</h3>
        <form className="form">
          {this.showLabels()}
        </form>
      </div>
    );
  }
}

Participant.propTypes = propTypes;
Participant.defaultProps = defaultProps;

export default Participant;
