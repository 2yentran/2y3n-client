import React, { Component, Fragment } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { withRouter, Redirect } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Paper,
  Typography,
  withStyles,
} from '@mui/material';
import { find } from 'lodash';
import { compose } from 'recompose';

import PostEditor from '../components/PostEditor';

const styles = theme => ({
  pokemons: {
    marginTop: theme.spacing(2),
  },
  card: {
    maxWidth: 300,
  },
  media: {
    height: 300,
  },
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
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
    this.setState({ loading: false, pokemons: (await this.fetch('get', '/pokemons?search=electric')) || [] });
  }

  savePokemon = async (pokemon) => {
    if (pokemon._id) {
      await this.fetch('put', `/pokemons/${pokemon._id}`, pokemon);
    } else {
      await this.fetch('pokemon', '/pokemons', pokemon);
    }

    this.props.history.goBack();
    this.getPokemons();
  }

  async deletePokemon(pokemon) {
    if (window.confirm(`Are you sure you want to delete "${pokemon.title}"`)) {
      await this.fetch('delete', `/pokemons/${pokemon._id}`);
      this.getPokemons();
    }
  }

  renderPokemon = ({ match: { params: { id } } }) => {
    if (this.state.loading) return null;
    const pokemon = find(this.state.pokemons, { _id: id });

    if (!pokemon && id !== 'new') return <Redirect to="/pokemons" />;

    return <PostEditor pokemon={pokemon} onSave={this.savePokemon} />;
  };

  render() {
    const { classes } = this.props;

    return (
      <Fragment>
        <Typography variant="h4">Pokedex</Typography>
        {/*<form method="get" action="/">
          <div className="form-group col-md-4 offset-md-4">
            <label>Search for your Pokemon<br />(by name, id, or type)</label>
            <input type="text" className="form-control" id="search" name="search" />
          </div>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>*/}
        <label>Wait for it to load</label>
        {this.state.pokemons.length > 0 ? (
          <Grid container className={classes.root} spacing={2}>
            {this.state.pokemons.map(pokemon => (
              <Paper className={classes.paper}>
                <Grid item xs={12}>
                  <Card className={classes.card} key={pokemon.id}>
                    <CardActionArea>
                      <CardMedia
                        className={classes.media}
                        image={`https://img.pokemondb.net/artwork/${pokemon.name}.jpg`}
                        title={pokemon.name}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                          {pokemon.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          {pokemon.flavor_text}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions>
                      <Button size="small" color="primary">
                        Share
                      </Button>
                      <Button size="small" color="primary">
                        Learn More
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Paper>
            ))}
          </Grid>
        ) : (
            !this.state.loading && <Typography variant="subtitle1">No pokemons to display</Typography>
          )}
      </Fragment>
    );
  }
}

export default compose(useOktaAuth, withRouter, withStyles(styles))(Pokedex);
