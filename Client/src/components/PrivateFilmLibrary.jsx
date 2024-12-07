import React from 'react';
import { Table, Form } from 'react-bootstrap/'
import { Link, useLocation } from 'react-router-dom';
import Pagination from "react-js-pagination";
import { Film } from '../models/Film';


function PrivateFilmTable(props) {

  const handlePageChange = pageNumber => {
    props.refreshFilms(pageNumber);
  }

  

  return (
    <>
    <Table>
      <tbody>
        {
          props.films.map((film) =>
            <PrivateFilmRow filmData={film} key={film.id} id={film.id}
              deleteFilm={props.deleteFilm} updateFilm={props.updateFilm} />
          )
        }
        
      </tbody>
    </Table>


       <Pagination 
          itemClass="page-item" // add it for bootstrap 4
          linkClass="page-link" // add it for bootstrap 4
          activePage={parseInt(sessionStorage.getItem("currentPage"))}
          itemsCountPerPage={parseInt(sessionStorage.getItem("totalItems"))/parseInt(sessionStorage.getItem("totalPages"))}
          totalItemsCount={parseInt(sessionStorage.getItem("totalItems"))}
          pageRangeDisplayed={10}
          onChange={handlePageChange}
          pageSize ={parseInt(sessionStorage.getItem("totalPages"))}
      />


    </>

  );
}

function PrivateFilmRow(props) {

  const formatWatchDate = (dayJsDate, format) => {
    return dayJsDate.isValid() ? dayJsDate.format(format) : '';
  }

  const location = useLocation();

  const handleUpdateRating = (newRating, oldRating) => {
    if (newRating !== oldRating) props.updateFilm(new Film({ ...props.filmData, rating: newRating }))
  }

  return (
    <tr>
      <td>
        <Link to={"/private/edit/" + props.filmData.id} state={[{film: props.filmData},{nextpage: location.pathname}]}>
          <i className="bi bi-pencil-square" />
        </Link>
        &nbsp; &nbsp;
        { /* Forces link to the same page so that has the same appearence of the edit link */ }
        <Link to={{}}> 
          <i className="bi bi-trash" onClick={() => { props.deleteFilm(props.filmData) }} />
        </Link>
      </td>
      <td>
        { /* NOTE: HTML collapses multiple withespaces into one, so "Hello      world!" becomes "Hello world!". If you want to keep them use white-space: pre-wrap; */}
        <p className={ [ 'keep-white-space', props.filmData.favorite ? "bi-favorite" : "" ].join(' ')}>
          {`${props.filmData.title}`}
        </p>
      </td>
      <td>
        {props.filmData.favorite ? <small>Favorite</small> : ''}
      </td>
      <td>
        {props.filmData.watchDate ? <small>{formatWatchDate(props.filmData.watchDate, 'MMMM D, YYYY')}</small> : ''}
      </td>
      <td>
        <Rating rating={props.filmData.rating} maxStars={10} />
      </td>
    </tr>
  );
}

function Rating(props) {
  return [...Array(props.maxStars)].map((el, idx) =>
    <i  key={idx} className={(idx < props.rating) ? "bi bi-star-fill" : "bi bi-star"}/>
  )
}


export default PrivateFilmTable;