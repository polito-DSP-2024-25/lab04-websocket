import { Film } from './models/Film';
import { Review } from './models/Review';
import { User } from './models/User';

const SERVER = 'http://localhost:3001';

/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {
         // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
         response.json()
            .then( json => resolve(json) )
            .catch( err => reject({ error: "Cannot parse server response" }))

        } else {
          // analyzing the cause of error
          response.json()
            .then(obj => 
              reject(obj)
              ) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err => 
        reject({ error: "Cannot communicate"  })
      ) // connection error
  });
}

/**
 * Getting from the Film Manager resource with hyperlinks
 */
const getFilmManager = async () => {
  return getJson(fetch(SERVER + "/api")).then( fm => {return fm;})
}

/**
 * Getting from the server side and returning the list of private films.
 */
const getPrivateFilms = async (filmManager, pageNumber) => {
  let path = SERVER + filmManager["privateFilms"];
  if(pageNumber != undefined) path += '?pageNo=' + pageNumber;
 
  return getJson(fetch(path, { credentials: 'include' })).then( json => { 
    sessionStorage.setItem('totalPages',  json.totalPages);
    sessionStorage.setItem('currentPage', json.currentPage);
    sessionStorage.setItem('totalItems',  json.totalItems);
    sessionStorage.setItem('filmsType',  'private');
    if(json.totalPages != 0)
      return json.films.map((film) => new Film({"id": film.id, "title": film.title.trim(), "owner": parseInt(film.owner), "privateFilm": film.private, "watchDate": film.watchDate, "rating": film.rating, "favorite": film.favorite, "self": film.self}));
    else
      return [];
  })
}

/**
 * Getting from the server side and returning the list of private films.
 */
 const getPublicFilms = async (filmManager, pageNumber) => {
  let path = SERVER + filmManager["publicFilms"];
  if(pageNumber != undefined) path += '?pageNo=' + pageNumber;
  return getJson(fetch(path, { credentials: 'include' })).then( json => { 
    sessionStorage.setItem('totalPages',  json.totalPages);
    sessionStorage.setItem('currentPage', json.currentPage);
    sessionStorage.setItem('totalItems',  json.totalItems);
    sessionStorage.setItem('filmsType',  'public');
    if(json.totalPages != 0)
      return json.films.map((film) => new Film({"id": film.id, "title": film.title.trim(), "owner": parseInt(film.owner), "privateFilm": film.private, "watchDate": film.watchDate, "rating": film.rating, "favorite": film.favorite, "self": film.self, "reviews": film.reviews}));
    else
      return [];
  })
}


/**
 * Getting from the server side and returning the list of private films.
 */
 const getPublicFilmsToReview = async (filmManager, pageNumber) => {
  let path = SERVER + filmManager["invitedPublicFilms"];
  if(pageNumber != undefined) path += '?pageNo=' + pageNumber;
  return getJson(fetch(path, { credentials: 'include' })).then( json => { 
    sessionStorage.setItem('totalPages',  json.totalPages);
    sessionStorage.setItem('currentPage', json.currentPage);
    sessionStorage.setItem('totalItems',  json.totalItems);
    sessionStorage.setItem('filmsType',  'public');
    if(json.totalPages != 0)
      return json.films.map((film) => new Film(film));
    else
      return [];
  })
}

/**
 * Getting from the server side and returning the list of film reviews.
 */
 const getFilmReviews = async (film, pageNumber) => {
  var path = SERVER + film.reviews;
  if(pageNumber != undefined) path += '?pageNo=' + pageNumber;
  return getJson(fetch(path, { credentials: 'include' })).then( json => { 
    sessionStorage.setItem('totalPages',  json.totalPages);
    sessionStorage.setItem('currentPage', json.currentPage);
    sessionStorage.setItem('totalItems',  json.totalItems);
    if(json.totalPages != 0)
      return json.reviews.map((review) => new Review(review));
    else
      return [];
  }).catch( err => {
    sessionStorage.setItem('totalPages',  0);
    sessionStorage.setItem('currentPage', 0);
    sessionStorage.setItem('totalItems',  0);
    return [];
  })
}

/**
 * Getting and returing a film, specifying its filmId.
 */
const getFilm = async (film) => {
  return getJson( fetch(SERVER + film.self, { credentials: 'include' }))
    .then( film => {film.privateFilm = film.private; return new Film(film);} )
}

/**
 * This function wants a film object as parameter. If the filmId exists, it updates the film in the server side.
 */
async function updateFilm(film) {
  const selfLink = film.self;
  if(film.watchDate)
    film.watchDate = film.watchDate.format('YYYY-MM-DD');
  delete film.self;
  delete film.reviews;
  const response = await fetch(
      SERVER + selfLink, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(film) // dayjs date is serialized correctly by the .toJSON method override
    })
    if(!response.ok){
      let err = { status: response.status, errObj: response.json };
      throw err; 
    }
    return response.ok;
}
/**
 * This function adds a new film in the back-end library.
 */
function addFilm(filmManager, film) {
  if(film.watchDate)
    film.watchDate = film.watchDate.format('YYYY-MM-DD');
  return getJson(
    fetch(SERVER + filmManager["films"], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(film) 
    })
  )
}

/**
 * This function deletes a film from the back-end library.
 */
async function deleteFilm(film) {
  const response = await fetch(SERVER + film.self, {
    method: 'DELETE',
    credentials: 'include'
  });
  if(!response.ok){
    let err = { status: response.status, errObj: response.json };
    throw err; 
  }
  return response.ok;
}


/**
 * This function issues a new review.
 */
 function issueReview(film, user) {
  const jsonUser = JSON.stringify([{filmId: film.id, reviewerId : user.userId}]);
  return getJson(
    fetch(SERVER + film.reviews, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: jsonUser
    })
  )
}


/**
 * This function deletes an issued review.
 */
 async function deleteReview(review) {
  const response = await fetch(SERVER + review.self, {
    method: 'DELETE',
    credentials: 'include'
  });
  if(!response.ok){
    let err = { status: response.status, errObj: response.json };
    throw err; 
  }
  return response.ok;
}

/**
 * Getting a review
 */
 const getReview = async (review) => {
  return getJson( fetch(SERVER + review.self, { credentials: 'include' }))
    .then( review => {return review;} )
}


/**
 * This function updates a review
 */
 async function updateReview(review) {
  if(review.reviewDate)
  review.reviewDate = review.reviewDate.format('YYYY-MM-DD');
  const response = await fetch(
      SERVER + review.self, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(review) // dayjs date is serialized correctly by the .toJSON method override
    })
    if(!response.ok){
      let err = { status: response.status, errObj: response.json };
      throw err; 
    }
    return response.ok;
}

/**
 * This function selects a filmn
 */
async function selectFilm(film, user) {
  const response = await fetch(
        SERVER + user.selection, {
          method: 'PUT', headers: {'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(film)});
  if(!response.ok){
    let err = { status: response.status, errObj: response.json };
    throw err; 
  }
}

/**
 * This function wants email and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (filmManager, credentials) => {
  return getJson(fetch(SERVER + filmManager["usersAuthenticator"], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  })
  )
};


/**
 * This function is used to retrieve the users of the service.
 * It returns a JSON object with the users.
 */


 async function getUsers(filmManager) {
  const response = await fetch(SERVER + filmManager['users'], {
    credentials: 'include',
  });
  const responseJson = await response.json();
  if (response.ok) {
      return responseJson.map((u) => new User(u));
  } else {
      let err = { status: response.status, errObj: responseJson };
      throw err; // An object with the error coming from the server
  }

}


const API = {logIn, getUsers, getFilmManager, getPrivateFilms, getPublicFilms, getFilmReviews, updateFilm, deleteFilm, addFilm, getFilm, issueReview, deleteReview, getReview, updateReview, getPublicFilmsToReview, selectFilm};
export default API;
