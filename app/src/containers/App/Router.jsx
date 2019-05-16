import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Layout from '../Layout/index';
import MainWrapper from './MainWrapper';

import LogIn from '../LogIn/index';
import Bracket from '../Bracket/index';
import Download from '../Download/index';
import Landing from '../Landing/Landing';

const wrappedRoutes = () => (
  <div>
    <Layout />
    <div className="container__wrap">
      <Route exact path="/" component={Landing} />
      <Route exact path="/download" component={Download} />
      <Route exact path="/downloads" component={Download} />
      <Route exact path="/login" component={LogIn} />
      <Route path="/bracket/:id?" component={Bracket} />
    </div>
  </div>
);

const Router = () => (
  <MainWrapper>
    <main>
      <Switch>
        <Route path="/" component={wrappedRoutes} />
      </Switch>
    </main>
  </MainWrapper>
);

export default Router;
