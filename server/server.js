const express = require('express');
const path = require('path');
const { seedTitles, movies } = require('./movie-model');

const app = express();
const port = 3000;
const apiKey = '3b759f50';

app.use(express.static(path.join(__dirname, 'files')));
app.use(express.json());

async function loadMoviesFromOmdb() {
  for (const title of seedTitles) {
    const response = await fetch(
        `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}`
    );
    const data = await response.json();

    if (data.Response === 'True') {
      movies[data.imdbID] = {
        imdbID: data.imdbID,
        Title: data.Title,
        Released: data.Released === 'N/A' ? 'Date unknown' : data.Released,
        Runtime: parseInt(data.Runtime) || 0,
        Genres: data.Genre ? data.Genre.split(', ') : [],
        Directors: data.Director ? data.Director.split(', ') : [],
        Writers: data.Writer ? data.Writer.split(', ') : [],
        Actors: data.Actors ? data.Actors.split(', ') : [],
        Plot: data.Plot,
        Poster: data.Poster,
        Metascore: parseInt(data.Metascore) || 0,
        imdbRating: parseFloat(data.imdbRating) || 0
      };
    }
  }
}

app.get('/movies', function (req, res) {
  const genre = req.query.genre;
  let result = Object.values(movies);

  if (genre) {
    result = result.filter(movie => movie.Genres.includes(genre));
  }

  res.json(result);
});

app.get('/genres', function (req, res) {
  const genres = [...new Set(Object.values(movies).flatMap(movie => movie.Genres))]
      .sort((a, b) => a.localeCompare(b));

  res.json(genres);
});

app.get('/movies/:imdbID', function (req, res) {
  const movie = movies[req.params.imdbID];

  if (movie) {
    res.send(movie);
  } else {
    res.sendStatus(404);
  }
});

app.put('/movies/:imdbID', function (req, res) {
  const imdbID = req.params.imdbID;
  const movie = req.body;

  const exists = !!movies[imdbID];
  movies[imdbID] = movie;

  if (exists) {
    res.sendStatus(200);
  } else {
    res.status(201).send(movie);
  }
});

loadMoviesFromOmdb()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server now listening on http://localhost:${port}/`);
      });
    })
    .catch(error => {
      console.error('Startup error:', error);
    });