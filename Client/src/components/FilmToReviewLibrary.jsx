import React from 'react';
import { Table, Button, Form } from 'react-bootstrap/'
import { Link, useLocation } from 'react-router-dom';
import Pagination from "react-js-pagination";

function FilmToReviewTable(props) {

  const handlePageChange = pageNumber => {
    props.refreshFilms(pageNumber);
  }

  

  return (
    <>
    <Table>
      <tbody>
        {
          props.films.map((film) =>
            <PublicFilmRow filmData={film} key={film.id} id={film.id}
              deleteFilm={props.deleteFilm} updateFilm={props.updateFilm} selectFilm={props.selectFilm} onlineList={props.onlineList} user={props.user}/>
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

function PublicFilmRow(props) {

  /* location hook is used to pass state to the edit view (or add view). 
   * So, we may be able to come back to the last selected filter view if cancel is pressed.
   */
  const location = useLocation();
  var selectedFilmId = -1;

  for(var i=0;i<props.onlineList.length;i++){
    if(props.onlineList[i].userId==sessionStorage.getItem('userId')){
      selectedFilmId = props.onlineList[i].filmId;
    }
  }

  return (
    <tr>
      <td>
       {
        props.filmData.owner == sessionStorage.getItem("userId") &&
        <Link to={"/public/edit/" + props.filmData.id} state={[{film : props.filmData}, {nextpage: location.pathname}]}>
          <i className="bi bi-pencil-square" />
        </Link>
      }
      &nbsp; &nbsp;
      {
        props.filmData.owner == sessionStorage.getItem("userId") &&
        <Link to={{}}> 
          <i className="bi bi-trash" onClick={() => { props.deleteFilm(props.filmData) }} />
        </Link>
      }
      </td>
      <td>
        <Form.Check type="checkbox">
            <Form.Check.Input type="radio" checked={props.filmData.id == selectedFilmId} onChange={ (ev) => props.selectFilm(props.filmData, props.user)} />
        </Form.Check>
      </td>
      <td>
        <p className={ [ 'keep-white-space', props.filmData.favorite ? "bi-favorite" : "" ].join(' ')}>
          {`${props.filmData.title}`}
        </p>
      </td>
      <td>
        <Link to={"/public/" + props.filmData.id + "/reviews"} state={[{film : props.filmData}, {nextpage: location.pathname}]}>
          <Button variant="primary">Read Reviews</Button>{' '}
        </Link>
      </td>
      <td>
       {
        props.filmData.owner == sessionStorage.getItem("userId") &&
        <Link to={"/public/" + props.filmData.id + "/issue"} state={[{film : props.filmData}, {nextpage: location.pathname}]}>
          <Button variant="secondary">Issue Review</Button>{' '}
        </Link>
      }
      </td>
    </tr>
  );
}

export default FilmToReviewTable;