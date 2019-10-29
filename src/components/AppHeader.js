import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Button, Toolbar, withStyles } from '@material-ui/core';
import logo from '../images/logo512.png';

import LoginButton from './LoginButton';

const styles = {
  flex: {
    flex: 1,
  },
  header: {
    color: '#fff',
    backgroundColor: '#990000',
  },
  appLogo: {
    height: '60px'
  }
};

const AppHeader = ({ classes }) => (
  <AppBar position="static" className={classes.header}>
    <Toolbar>
      <Button color="inherit" component={Link} to="/">
        <img src={logo} className={classes.appLogo} alt="logo" />
      </Button>
      <Button color="inherit" component={Link} to="/posts">Posts</Button>
      <Button color="inherit" component={Link} to="/pokedex">Pokedex</Button>
      <div className={classes.flex} />
      <LoginButton />
    </Toolbar>
  </AppBar>
);

export default withStyles(styles)(AppHeader);
