import * as dayjs from 'dayjs';

/**
 * Constructor function for new Review objects
*/
function Review({ filmId, reviewerId, completed, reviewDate, rating, review, self } = {}) {

    this.filmId = filmId;
    this.reviewerId = reviewerId;
    this.completed = completed;

    if(reviewDate)
    {
        this.reviewDate = dayjs(reviewDate);
    }
    if(rating)
        this.rating = rating;
    if(review)
        this.review = review;
    if(self)
        this.self = self;
        
}

export { Review }
