import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/lib/Creatable';
import Label from './Label';


const propTypes = {
  bracket: PropTypes.string,
  labels: PropTypes.objectOf(PropTypes.any),
  updateLabelProperty: PropTypes.func,
  addLabel: PropTypes.func,
};

const defaultProps = {
  bracket: null,
  labels: null,
  updateLabelProperty: null,
  addLabel: null,
};

class LabelEditor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selected: {
        label: '',
        value: '',
      },
      label: null,
    };
  }

  componentWillReceiveProps() {
    this.forceUpdate();
  }

  updateSelectedLabel = (selectedOption) => {
    const { labels, addLabel } = this.props;
    if (selectedOption.value in labels) {
      const label = labels[selectedOption.value];
      this.setState({
        selected: selectedOption,
        label,
      }, () => {
        this.forceUpdate();
      });
    } else {
      const label = {
        name: selectedOption.value,
        type: 'string',
        default: '',
      };
      this.setState({
        selected: selectedOption,
        label,
      });
      addLabel(label);
    }
  }

  update = (e) => {
    const { label } = this.state;
    const { bracket } = this.props;
    e.preventDefault();
    if (label != null) {
      console.log('hi');
      const apiURL = 'https://teacup-challonge.herokuapp.com/labels/update';
      const updateData = {
        id: bracket,
        label,
      };
      fetch(apiURL, {
        method: 'put',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }

  delete = (e) => {
    const { label } = this.state;
    const { bracket } = this.props;
    e.preventDefault();
    if (label != null) {
      const apiURL = 'https://teacup-challonge.herokuapp.com/labels/delete';
      const updateData = {
        id: bracket,
        name: label.name,
      };
      fetch(apiURL, {
        method: 'put',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      this.setState({
        selected: {
          label: '',
          value: '',
        },
        label: null,
      });
    }
  }

  showLabel = () => {
    const { selected, label } = this.state;
    if (selected != null && selected.value !== '') {
      if (label != null) {
        return (
          <div>
            <Label
              label={label}
              id={selected.value}
              updateLabelProperty={this.props.updateLabelProperty}
            />
            <div className="float-right">
              <Button
                color="secondary"
                type="submit"
                onClick={e => this.delete(e)}
              >
                Delete
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
        <p>Loading label...</p>
      );
    }
    return (
      <p>Select a label.</p>
    );
  }

  render() {
    const { bracket, labels } = this.props;
    if (bracket != null) {
      const options = [];
      Object.keys(labels).forEach((option) => {
        if (option !== 'name' && option !== 'score') {
          options.push({
            label: option,
            value: option,
          });
        }
      });
      return (
        <div>
          <form className="form">
            <div className="form__form-group">
              <span className="form__form-group-label">Label</span>
              <CreatableSelect
                name="selectedLabel"
                value={this.state.selected}
                placeholder="Label Name"
                onChange={this.updateSelectedLabel}
                options={options}
              />
            </div>
          </form>
          {this.showLabel()}
        </div>
      );
    }
    return (
      <p>Waiting on bracket.</p>
    );
  }
}

LabelEditor.propTypes = propTypes;
LabelEditor.defaultProps = defaultProps;

export default LabelEditor;
