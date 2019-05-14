import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonToolbar } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';

const propTypes = {
  user: PropTypes.objectOf(PropTypes.any),
  handleSubmit: PropTypes.func,
};

const defaultProps = {
  user: null,
  handleSubmit: null,
};

class ChallongeImportForm extends PureComponent {
  constructor() {
    super();
    this.state = {
      challongeURL: '',
      status: 'Enter the Challonge URL Code below.',
    };
  }

  loadBracket = (e) => {
    const { user, handleSubmit } = this.props;
    const { challongeURL } = this.state;
    e.preventDefault();
    const username = user.user;
    const userKey = user.key;
    const apiURL = `https://teacup-challonge.herokuapp.com/init?user=${username}&key=${userKey}&id=${challongeURL}`;
    console.log(apiURL);
    fetch(apiURL, {
      method: 'get',
    })
      .then(
        (result) => {
          console.log('result returned.');
          result.json().then((data) => {
            console.log(data);
            if (data.isOwner) {
              handleSubmit(challongeURL);
            } else {
              this.setState({
                status: 'You are not authorized to load this bracket!',
              });
            }
          });
        },
        () => {
          this.setState({
            status: 'An error occurred!',
          });
        },
      );
  }

  updateURL = (e) => {
    this.setState({
      challongeURL: e.target.value,
    });
  }

  render() {
    const { status } = this.state;
    return (
      <div>
        <p><b>{status}</b></p>
        <br />
        <form className="form">
          <div className="form__form-group">
            <label htmlFor="challongeURL" className="form__form-group-label">Challonge URL Code</label>
            <div className="form__form-group-field">
              <Field
                id="challongeURL"
                name="challongeURL"
                component="input"
                type="text"
                placeholder="Challonge URL Code"
                onChange={e => this.updateURL(e)}
              />
            </div>
          </div>
          <ButtonToolbar className="form__button-toolbar">
            <Button
              color="primary"
              type="submit"
              onClick={e => this.loadBracket(e)}
            >
              Load
            </Button>
          </ButtonToolbar>
        </form>
      </div>
    );
  }
}

ChallongeImportForm.propTypes = propTypes;
ChallongeImportForm.defaultProps = defaultProps;

export default reduxForm({
  form: 'challonge_import_form', // a unique identifier for this form
})(ChallongeImportForm);
