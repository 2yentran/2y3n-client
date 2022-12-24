import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';
import { SecureRoute, LoginCallback } from '@okta/okta-react';
import { CssBaseline, withStyles } from '@mui/material';

import AppHeader from './components/AppHeader';
import Home from './pages/Home';
import Pokedex from './pages/Pokedex';
import PostsManager from './pages/PostsManager';

const styles = theme => ({
  main: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
    },
  },
});

const App = ({ classes }) => (
  <Fragment>
    <CssBaseline />
    <AppHeader />
    <main className={classes.main}>
      <Route exact path="/" component={Home} />
      <SecureRoute path="/posts" component={PostsManager} />
      <SecureRoute path="/pokedex" component={Pokedex} />
      <Route path="/implicit/callback" component={LoginCallback} />
    </main>
  </Fragment>
);

export default withStyles(styles)(App);
