function omdbDateToInputDate(value) {
  if (!value || value === 'N/A' || value === 'Date unknown') {
    return '';
  }

  const match = value.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);

  if (!match) {
    return value;
  }

  const [, day, monthName, year] = match;
  const months = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12'
  };

  const month = months[monthName];

  if (!month) {
    return '';
  }

  return `${year}-${month}-${day.padStart(2, '0')}`;
}

function inputDateToStoredDate(value) {
  if (!value) {
    return '';
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return value;
  }

  const [, year, month, day] = match;
  const months = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec'
  };

  return `${Number(day)} ${months[month]} ${year}`;
}

function setMovie(movie) {
  const elements = Array.from(document.forms[0].elements).filter(el => el.id);

  for (const element of elements) {
    const name = element.id;
    const value = movie[name];

    if (name === 'Genres') {
      Array.from(element.options).forEach(option => {
        option.selected = Array.isArray(value) && value.includes(option.value);
      });
    } else if (name === 'Released') {
      element.value = omdbDateToInputDate(value);
    } else if (Array.isArray(value)) {
      element.value = value.join(', ');
    } else {
      element.value = value ?? '';
    }
  }
}

function getMovie() {
  const movie = {};
  const elements = Array.from(document.forms[0].elements).filter(el => el.id);

  for (const element of elements) {
    const name = element.id;
    let value;

    if (name === 'Genres') {
      value = Array.from(element.selectedOptions).map(option => option.value);
    } else if (name === 'Released') {
      value = inputDateToStoredDate(element.value);
    } else if (['Actors', 'Directors', 'Writers'].includes(name)) {
      value = element.value
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
    } else if (['Metascore', 'Runtime', 'imdbRating'].includes(name)) {
      value = Number(element.value) || 0;
    } else {
      value = element.value.trim();
    }

    movie[name] = value;
  }

  return movie;
}

function putMovie() {
  const movie = getMovie();

  const xhr = new XMLHttpRequest();
  xhr.open('PUT', `/movies/${movie.imdbID}`);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      location.href = 'index.html';
    } else {
      alert('Movie could not be updated');
    }
  };

  xhr.send(JSON.stringify(movie));
}

window.onload = function () {
  const params = new URLSearchParams(window.location.search);
  const imdbID = params.get('imdbID');

  if (!imdbID) {
    alert('No imdbID provided');
    return;
  }

  document.getElementById('imdbID').value = imdbID;

  const xhr = new XMLHttpRequest();
  xhr.open('GET', `/movies/${imdbID}`);

  xhr.onload = function () {
    if (xhr.status === 200) {
      const movie = JSON.parse(xhr.responseText);
      setMovie(movie);
    } else {
      alert('Movie not found');
    }
  };

  xhr.send();
};