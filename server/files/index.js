const nav = document.querySelector('.genre-nav');
const movieList = document.getElementById('movie-list');

function appendMovie(movie) {
  const article = document.createElement('article');
  article.className = 'movie-card';
  article.id = movie.imdbID;
  article.setAttribute('aria-labelledby', `title-${movie.imdbID}`);

  article.innerHTML = `
    <figure>
      <img
        src="${movie.Poster}"
        alt="${movie.Title} poster"
        class="poster"
        loading="lazy"
      >
    </figure>

    <header>
      <h2 id="title-${movie.imdbID}" class="movie-title">${movie.Title}</h2>
      <div class="movie-meta">
        <span>📅 ${movie.Released}</span>
        <span>⏱️ ${movie.Runtime} min</span>
        <span class="rating">⭐ ${movie.imdbRating}</span>
      </div>
    </header>

    <section aria-label="Plot summary">
      <p class="plot">${movie.Plot}</p>
    </section>

    <section aria-label="Genres">
      <ul class="genres">
        ${movie.Genres.map(genre => `<li class="genre-tag">${genre}</li>`).join('')}
      </ul>
    </section>

    <aside aria-label="Production credits">
      <dl class="credits-section">
        <div>
          <dt>Directors</dt>
          <dd>${movie.Directors.join(', ')}</dd>
        </div>
        <div>
          <dt>Writers</dt>
          <dd>${movie.Writers.join(', ')}</dd>
        </div>
        <div>
          <dt>Actors</dt>
          <dd>${movie.Actors.slice(0, 3).join(', ')}${movie.Actors.length > 3 ? ' et al.' : ''}</dd>
        </div>
        <div>
          <dt>Metascore</dt>
          <dd>${movie.Metascore}</dd>
        </div>
      </dl>
    </aside>

    <footer>
      <button class="edit-btn">Edit</button>
    </footer>
  `;

  article.querySelector('.edit-btn').addEventListener('click', function () {
    location.href = `edit.html?imdbID=${movie.imdbID}`;
  });

  movieList.appendChild(article);
}

function setActiveButton(selectedGenre) {
  nav.querySelectorAll('button').forEach(button => {
    button.classList.toggle('active', button.dataset.genre === selectedGenre);
  });
}

function loadMovies(genre = '') {
  const params = new URLSearchParams();

  if (genre) {
    params.set('genre', genre);
  }

  const xhr = new XMLHttpRequest();
  const url = params.toString() ? `/movies?${params.toString()}` : '/movies';
  xhr.open('GET', url);

  xhr.onload = function () {
    movieList.replaceChildren();

    if (xhr.status === 200) {
      const movies = JSON.parse(xhr.responseText);
      movies.forEach(appendMovie);
      setActiveButton(genre);
    } else {
      movieList.textContent = `Data could not be loaded, status ${xhr.status}`;
    }
  };

  xhr.send();
}

function appendGenreButton(label, genre = '') {
  const button = document.createElement('button');
  button.className = 'genre-button';
  button.textContent = label;
  button.dataset.genre = genre;

  button.addEventListener('click', function () {
    loadMovies(genre);
  });

  nav.appendChild(button);
}

function loadGenres() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/genres');

  xhr.onload = function () {
    if (xhr.status === 200) {
      const genres = JSON.parse(xhr.responseText);

      nav.replaceChildren();
      appendGenreButton('All', '');
      genres.forEach(genre => appendGenreButton(genre, genre));

      const firstButton = nav.querySelector('button');
      if (firstButton) {
        firstButton.click();
      }
    } else {
      nav.textContent = 'Genres could not be loaded.';
    }
  };

  xhr.send();
}

window.onload = loadGenres;