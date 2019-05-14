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
    this.state = {
      collapse: false,
      username: 'User',
    };
    if (cookies.get('user')) {
      this.state = {
        username: cookies.get('user').user,
        collapse: false,
      };
    }
  }

  toggle = () => {
    this.setState({ collapse: !this.state.collapse });
  };

  render() {
    const { username, collapse } = this.state;
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
            <TopbarMenuLink title="My Brackets" icon="list" path="/brackets" />
            <div className="topbar__menu-divider" />
            <TopbarMenuLink title="Log Out" icon="exit" path="/login" />
          </div>
        </Collapse>
      </div>
    );
  }
}

TopbarProfile.propTypes = propTypes;

export default withCookies(TopbarProfile);
