import React, { PureComponent } from 'react';
import EyeIcon from 'mdi-react/EyeIcon';
import KeyVariantIcon from 'mdi-react/KeyVariantIcon';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import PropTypes from 'prop-types';
import CheckBox from '../../../shared/components/form/CheckBox';

class LogInForm extends PureComponent {
  static propTypes = {
    onSuccess: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = {
      showKey: false,
      formDisabled: false,
      user: '',
      key: '',
      rememberMe: false,
    };
  }

  showKey = (e) => {
    e.preventDefault();
    this.setState({
      showKey: !this.state.showKey,
    });
  }

  signIn = (e) => {
    const apiURL = 'https://teacup-challonge.herokuapp.com';
    const { user, key, rememberMe } = this.state;
    e.preventDefault();
    this.setState({
      formDisabled: true,
    });
    console.log('signing in...');
    const requestURL = `${apiURL}/init?user=${user}&key=${key}`;
    console.log(requestURL);
    fetch(requestURL, {
      method: 'get',
    })
      .then(
        (result) => {
          console.log('result returned.');
          result.json().then((data) => {
            console.log(data);
            if (data.isAuthenticated) {
              this.props.onSuccess({
                user,
                key,
                rememberMe,
              });
            } else {
              this.setState({
                formDisabled: false,
              });
            }
          });
        },
        (error) => {
          console.log('error returned.');
          console.log(error);
          this.setState({
            formDisabled: false,
          });
        },
      );
  }

  updateUser = (e) => {
    this.setState({
      user: e.target.value,
    });
  }

  updateKey = (e) => {
    this.setState({
      key: e.target.value,
    });
  }

  updateRememberMe = (e) => {
    if (e) {
      this.setState({
        rememberMe: !this.state.rememberMe,
      });
    }
  }

  render() {
    const { showKey } = this.state;

    return (
      <form className="form">
        <div className="form__form-group">
          <span className="form__form-group-label">Username</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <AccountOutlineIcon />
            </div>
            <input
              name="user"
              type="text"
              placeholder="Challonge Username"
              onChange={e => this.updateUser(e)}
              disabled={this.state.formDisabled ? 'disabled' : ''}
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">API Key</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <KeyVariantIcon />
            </div>
            <input
              name="key"
              type={showKey ? 'text' : 'password'}
              placeholder="Challonge API Key"
              onChange={e => this.updateKey(e)}
              disabled={this.state.formDisabled ? 'disabled' : ''}
            />
            <button
              className={`form__form-group-button${showKey ? ' active' : ''}`}
              onClick={e => this.showKey(e)}
              type="button"
              disabled={this.state.formDisabled ? 'disabled' : ''}
            ><EyeIcon />
            </button>
          </div>
          <div className="account__forgot-password">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://challonge.com/settings/developer"
            >
              Locate API Key
            </a>
          </div>
        </div>
        <div className="form__form-group">
          <div className="form__form-group-field">
            <CheckBox
              name="rememberMe"
              label="Remember me"
              disabled={this.state.formDisabled ? 'disabled' : ''}
              onChange={e => this.updateRememberMe(e)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary account__btn account__btn--small"
          onClick={e => this.signIn(e)}
          disabled={this.state.formDisabled ? 'disabled' : ''}
        >
          Sign In
        </button>
      </form>
    );
  }
}

export default LogInForm;
