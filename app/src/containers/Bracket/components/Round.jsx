import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  round: PropTypes.string,
  updateRound: PropTypes.func,
};

const defaultProps = {
  round: null,
  updateRound: null,
};

class Round extends PureComponent {
  componentWillReceiveProps() {
    this.forceUpdate();
  }

  onChange = (e) => {
    const { updateRound } = this.props;
    updateRound(e);
  }

  render() {
    const { round } = this.props;
    return (
      <form className="form">
        <div className="form__form-group">
          <span className="form__form-group-label">Round</span>
          <div className="form__form-group-field">
            <input
              name="round"
              type="text"
              value={round}
              placeholder="Round"
              onChange={e => this.onChange(e)}
            />
          </div>
        </div>
      </form>
    );
  }
}

Round.propTypes = propTypes;
Round.defaultProps = defaultProps;

export default Round;
