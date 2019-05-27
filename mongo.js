const mongoose = require('mongoose');
 
mongoose.connect('mongodb://localhost:27017/bloglog', {useNewUrlParser: true});

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
 
const BlogPost = new Schema({
  author: ObjectId,
  title: String,
  body: String,
  date: Date
});


const Blog = mongoose.model('Blog', BlogPost);



const kitty = new Blog({ body: 'Zildjian' });
kitty.save().then(() => console.log('meow'));
Blog.find({},function (err,msg) {
    if(err){
        throw err;
    }
    console.log(msg)
})