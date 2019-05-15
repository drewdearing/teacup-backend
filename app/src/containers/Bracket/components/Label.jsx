import React, { PureComponent } from 'react';
import CreatableSelect from 'react-select/lib/Creatable';
import PropTypes from 'prop-types';
import SelectField from '../../../shared/components/form/Select';

const propTypes = {
  label: PropTypes.objectOf(PropTypes.any),
  updateLabelProperty: PropTypes.func,
  id: PropTypes.string,
};

const defaultProps = {
  label: null,
  updateLabelProperty: null,
  id: null,
};

class Label extends PureComponent {
  componentWillReceiveProps() {
    this.forceUpdate();
  }

  onChange = (e) => {
    const { id, updateLabelProperty } = this.props;
    updateLabelProperty(id, e);
  }

  onChangeOptions = (selectedOptions) => {
    const { id, updateLabelProperty } = this.props;
    updateLabelProperty(id, {
      target: {
        name: 'options',
        value: selectedOptions,
      },
    });
  }

  defaultField = (label) => {
    if (label.type === 'string') {
      return (
        <div className="form__form-group">
          <span className="form__form-group-label">Default Value</span>
          <div className="form__form-group-field">
            <input
              name="default"
              type="text"
              value={label.default}
              placeholder="Default Value"
              onChange={e => this.onChange(e)}
            />
          </div>
        </div>
      );
    } else if (label.type === 'int') {
      return (
        <div className="form__form-group">
          <span className="form__form-group-label">Default Value</span>
          <div className="form__form-group-field">
            <input
              name="default"
              type="number"
              value={label.default}
              onChange={e => this.onChange(e)}
            />
          </div>
        </div>
      );
    } else if (label.type === 'option_select') {
      const options = [];
      const value = {
        label: label.default,
        value: label.default,
      };
      label.options.forEach((option) => {
        options.push({
          label: option,
          value: option,
        });
      });
      return (
        <div className="form__form-group">
          <span className="form__form-group-label">Default Value</span>
          <SelectField
            options={options}
            value={value}
            name="default"
            placeholder="Default Value"
            onChange={this.onChange}
          />
        </div>
      );
    }
    return (null);
  }

  optionsField = (label) => {
    if (label.type === 'option_select') {
      const options = [];
      label.options.forEach((option) => {
        options.push({
          label: option,
          value: option,
        });
      });
      return (
        <div className="form__form-group">
          <span className="form__form-group-label">Options</span>
          <CreatableSelect
            isMulti
            value={options}
            className="basic-multi-select"
            options={options}
            name="options"
            placeholder="Options"
            onChange={this.onChangeOptions}
          />
        </div>
      );
    }
    return (null);
  }

  typeField = (label) => {
    const options = {
      string: {
        label: 'Text',
        value: 'string',
      },
      int: {
        label: 'Integer',
        value: 'int',
      },
      option_select: {
        label: 'Option Select',
        value: 'option_select',
      },
    };
    return (
      <div className="form__form-group">
        <span className="form__form-group-label">Type</span>
        <SelectField
          options={Object.values(options)}
          value={options[label.type]}
          name="type"
          placeholder="Type"
          onChange={this.onChange}
        />
      </div>
    );
  }

  render() {
    const { label } = this.props;
    return (
      <div>
        <form className="form">
          {this.typeField(label)}
          {this.optionsField(label)}
          {this.defaultField(label)}
        </form>
      </div>
    );
  }
}

Label.propTypes = propTypes;
Label.defaultProps = defaultProps;

export default Label;
