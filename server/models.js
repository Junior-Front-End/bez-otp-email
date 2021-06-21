const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
 

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    birthDate: Number,
    country: String,
    city: String,
    mobile: String,
    username: String,
    email: String,
    role: {type: mongoose.Schema.Types.ObjectId, ref: "Role" }
  }); 

const Role = mongoose.model("Role", new mongoose.Schema({ title: String }))

module.exports = {
  user: mongoose.model("User", userSchema),
  role: Role,
  ROLES: ["user", "admin", "moderator"]
};

const MONGO_HOST = process.env.MONGO_HOST
const MONGO_DB = process.env.MONGO_DB
const MONGO_PORT = process.env.MONGO_PORT

// initial
function initial() {

  Role.estimatedDocumentCount((err, count) => {

    if (!err && count === 0) {

      newRole("user"); 
      newRole("moderator"); 
      newRole("admin");

      function newRole(Name){
        new Role({title: Name}).save(err => {
          if (err) {console.log("error", err);}
          console.log("added '"+ Name +"' to roles collection");
        });
      } // newRole 

    } // if

  }); // Role.estimatedDocumentCount

} // initial 

// mongoose
mongoose.connect(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => { console.log("Successfully connect to Mongodb."); initial(); })
  .catch(err => { console.error("Connection error", err); process.exit(); });
// !mongoose
