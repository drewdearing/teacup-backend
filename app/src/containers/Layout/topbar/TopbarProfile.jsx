import React, { PureComponent } from 'react';
import DownIcon from 'mdi-react/ChevronDownIcon';
import PropTypes from 'prop-types';
import { Collapse } from 'reactstrap';
import { withCookies, Cookies } from 'react-cookie';
import TopbarMenuLink from './TopbarMenuLink';

const Ava = `${process.env.PUBLIC_URL}/img/ava.png`;

const propTypes = {
  cookies: PropTypes.instanceOf(Cookies).isRequired,
};

class TopbarProfile extends PureComponent {
  constructor(props) {
    super(props);
    const { cookies } = this.props;
    if (cookies.get('user') != null) {
      this.state = {
        username: cookies.get('user').user,
        collapse: false,
        isLoggedIn: true,
      };
    } else {
      this.state = {
        collapse: false,
        isLoggedIn: false,
      };
    }
  }

  toggle = () => {
    this.setState({ collapse: !this.state.collapse });
  };

  logOut = () => {
    const { cookies } = this.props;
    cookies.remove('user');
  }

  render() {
    const { username, collapse, isLoggedIn } = this.state;
    if (isLoggedIn) {
      return (
        <div className="topbar__profile">
          <button className="topbar__avatar" onClick={this.toggle}>
            <img className="topbar__avatar-img" src={Ava} alt="avatar" />
            <p className="topbar__avatar-name">{username}</p>
            <DownIcon className="topbar__icon" />
          </button>
          {collapse && <button className="topbar__back" onClick={this.toggle} />}
          <Collapse isOpen={collapse} className="topbar__menu-wrap">
            <div className="topbar__menu">
              <TopbarMenuLink title="Load Bracket" icon="list" path="/bracket" />
              <div className="topbar__menu-divider" />
              <TopbarMenuLink title="Log Out" onClick={this.logOut} icon="exit" path="/login" />
            </div>
          </Collapse>
        </div>
      );
    }
    return (
      <div className="topbar__profile">
        <button className="topbar__avatar" onClick={this.toggle}>
          <img className="topbar__avatar-img" src={Ava} alt="avatar" />
          <p className="topbar__avatar-name">Account</p>
          <DownIcon className="topbar__icon" />
        </button>
        {collapse && <button className="topbar__back" onClick={this.toggle} />}
        <Collapse isOpen={collapse} className="topbar__menu-wrap">
          <div className="topbar__menu">
            <TopbarMenuLink title="Log In" icon="exit" path="/login" />
          </div>
        </Collapse>
      </div>
    );
  }
}

TopbarProfile.propTypes = propTypes;

export default withCookies(TopbarProfile);
