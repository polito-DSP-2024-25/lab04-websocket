class User{    
    constructor(id, name, email, hash) {
        if(id)
            this.id = id;

        this.name = name;
        this.email = email;
        
        if(hash)
            this.hash = hash;

        var selfLink = "/api/users/" + this.id;
        this.selection = "/api/users/" + this.id + "/selection";
        this.self =  selfLink;
    }
}

module.exports = User;
