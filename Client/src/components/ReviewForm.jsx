import dayjs from 'dayjs';
import React, {useContext, useState} from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Review } from '../models/Review';
import MessageContext from '../messageCtx';



const ReviewForm = (props) => {

  const [filmId, setFilmId] = useState(props.review ? props.review.filmId : '');
  const [reviewerId, setReviewerId] = useState(props.review ? props.review.reviewerId : '');
  const [completed, setCompleted] = useState(props.review ? true : false);
  const [reviewDate, setReviewDate] = useState(props.review ? ((props.review.reviewDate != undefined && props.review.reviewDate != "") ? props.review.reviewDate : "") : dayjs().format('YYYY-MM-DD'));
  const [rating, setRating] = useState(props.review ? props.review.rating : 0);
  const [review, setReview] = useState(props.review ? props.review.review : 0);
  const [self, setSelf] = useState(props.review ? props.review.self : undefined);

  const navigate = useNavigate();
  const location = useLocation();
  const {handleErrors} = useContext(MessageContext);

  const nextpage = location.state?.nextpage || '/public/to_review';

  const handleSubmit = (event) => {
    event.preventDefault();
    if(reviewDate != "" && rating != undefined && review != undefined){
      const newReview = new Review( {filmId, reviewerId, completed, reviewDate, rating, review, self} );
      props.editReview(newReview);
      navigate('/public/to_review');
    }
    else {
      handleErrors("It is mandatory to specify values for Review Date, Rating and Review Text.");
    }
}


  return (
    <Form className="block-example border border-primary rounded mb-0 form-padding" onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Film ID</Form.Label>
        <Form.Control type="text" required={true} value={filmId} disabled />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Reviewer ID</Form.Label>
        <Form.Control type="text" required={true} value={reviewerId} disabled /> 
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check custom="true" type="checkbox" label="Completed" name="completed" checked={true} onChange={(event) => setCompleted(event.target.checked)} disabled />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Review Date</Form.Label>
        { 
        /* reviewDate is an optional parameter. It have to be properly rendered only if available. */ 
        }
        <Form.Control type="date" value={reviewDate} max={dayjs().format("YYYY-MM-DD")} onChange={(event) => setReviewDate(event.target.value)}/>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Rating</Form.Label>
        <Form.Select aria-label="Rating" defaultValue={rating} onChange={event => setRating(event.target.value)}>
          { [...Array(11)].map( (v, i) => <option key={i} value={i}>{i}</option>) }
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Review Text</Form.Label>
        <Form.Control as="textarea" rows={3} defaultValue={review} onChange={event => setReview(event.target.value)}/>
      </Form.Group>

      <Button className="mb-3" variant="primary" type="submit">Save</Button>
      &nbsp;
      <Link to={nextpage}> 
        <Button className="mb-3" variant="danger" >Cancel</Button>
      </Link>
    </Form>
  )

}

export default ReviewForm;
