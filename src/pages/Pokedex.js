import React, { Component, Fragment } from 'react';
import { withAuth } from '@okta/okta-react';
import { withRouter, Route, Redirect, Link } from 'react-router-dom';
import {
  withStyles,
  Typography,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
import moment from 'moment';
import { find, orderBy } from 'lodash';
import { compose } from 'recompose';

import PostEditor from '../components/PostEditor';
import ErrorSnackbar from '../components/ErrorSnackbar';

const styles = theme => ({
  pokemons: {
    marginTop: theme.spacing(2),
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  },
});

const API = process.env.REACT_APP_API || 'http://localhost:5000';

class Pokedex extends Component {
  state = {
    loading: true,
    pokemons: [],
    error: null,
  };

  componentDidMount() {
    this.getPokemons();
  }

  async fetch(method, endpoint, body) {
    try {
      const response = await fetch(`${API}${endpoint}`, {
        method,
        body: body && JSON.stringify(body),
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          authorization: `Bearer ${await this.props.auth.getAccessToken()}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error(error);

      this.setState({ error });
    }
  }

  async getPokemons() {
    this.setState({ loading: false, pokemons: (await this.fetch('get', '/pokemons')) || [] });
  }

  savePokemon = async (post) => {
    if (post._id) {
      await this.fetch('put', `/pokemons/${post._id}`, post);
    } else {
      await this.fetch('post', '/pokemons', post);
    }

    this.props.history.goBack();
    this.getPokemons();
  }

  async deletePokemon(post) {
    if (window.confirm(`Are you sure you want to delete "${post.title}"`)) {
      await this.fetch('delete', `/pokemons/${post._id}`);
      this.getPokemons();
    }
  }

  renderPokemon = ({ match: { params: { id } } }) => {
    if (this.state.loading) return null;
    const post = find(this.state.pokemons, { _id: id });

    if (!post && id !== 'new') return <Redirect to="/pokemons" />;

    return <PostEditor post={post} onSave={this.savePokemon} />;
  };

  render() {
    const { classes } = this.props;

    return (
      <Fragment>
        <Typography variant="h4">Pokedex</Typography>
        <form method="get" action="/">
          <div class="form-group col-md-4 offset-md-4">
            <label for="item">Search for your Pokemon<br />(by name, id, or type)</label>
            <input type="text" className="form-control" id="search" name="search" />
          </div>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
        {this.state.pokemons.length > 0 ? (
          <Paper elevation={1} className={classes.pokemons}>
            <List>
              {orderBy(this.state.pokemons, ['updatedAt', 'title'], ['desc', 'asc']).map(post => (
                <ListItem key={post._id} button component={Link} to={`/pokemons/${post._id}`}>
                  <ListItemText
                    primary={post.title}
                    secondary={post.updatedAt && `Updated ${moment(post.updatedAt).fromNow()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => this.deletePokemon(post)} color="inherit">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
            !this.state.loading && <Typography variant="subtitle1">No pokemons to display</Typography>
          )}
        <Fab
          color="secondary"
          aria-label="add"
          className={classes.fab}
          component={Link}
          to="/pokemons/new"
        >
          <AddIcon />
        </Fab>
        <Route exact path="/pokemons/:id" render={this.renderPokemon} />
        {this.state.error && (
          <ErrorSnackbar
            onClose={() => this.setState({ error: null })}
            message={this.state.error.message}
          />
        )}
      </Fragment>
    );
  }
}

export default compose(withAuth, withRouter, withStyles(styles))(Pokedex);
