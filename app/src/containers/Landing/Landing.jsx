import React, { Component } from 'react';

class Landing extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="account">
        <div className="account__wrapper">
          <div className="account__card">
            <div className="account__head">
              <h3 className="account__title">Welcome to
                <span className="account__logo"> tea
                  <span className="account__logo-accent">Cup</span>
                </span>
              </h3>
              <h4 className="account__subhead subhead">The Stream Assistant for Challonge</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;
