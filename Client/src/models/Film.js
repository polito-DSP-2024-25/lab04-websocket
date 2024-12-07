import * as dayjs from 'dayjs';

/**
 * Constructor function for new Film objects
*/
function Film({ id, title, owner, privateFilm, watchDate, rating, favorite, self, reviews} = {}) {

    if(id)
         this.id = id;
    this.title = title;
    this.owner = owner;
    this.private = privateFilm;

    if(watchDate){
        this.watchDate = dayjs(watchDate);
    }
        
    if(rating)
        this.rating = parseInt(rating);
    if(favorite != undefined)
        this.favorite = favorite;
    if(self)
        this.self = self;
    if(reviews)
        this.reviews = reviews;
}

export { Film }


