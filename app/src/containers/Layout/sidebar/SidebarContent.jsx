import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SidebarLink from './SidebarLink';

class SidebarContent extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
  };

  hideSidebar = () => {
    this.props.onClick();
  };

  render() {
    return (
      <div className="sidebar__content">
        <ul className="sidebar__block">
          <SidebarLink title="Bracket" icon="chart-bars" route="/bracket" onClick={this.hideSidebar} />
        </ul>
        <ul className="sidebar__block">
          <SidebarLink title="Downloads" icon="cloud-download" route="/downloads" onClick={this.hideSidebar} />
        </ul>
      </div>
    );
  }
}

export default SidebarContent;