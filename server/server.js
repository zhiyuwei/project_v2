const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/library';

let db;

let aboutMessage = "User Info API v1.0";

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },
});


const resolvers = {
  Query: {
    about: () => aboutMessage,
    currentuser,
    bookList,
    loanList,
    userList,
    searchBook,
    reviewList,
    findOldBook,
    oldbookList,
    myinfoList,

  },
  Mutation: {
    setAboutMessage,
    userAdd,
    userLogin,
    bookAdd,
    bookDelete,
    bookReturn,
    userUpdate,
    reviewAdd,
    loanAdd,
    availDel,
    oldbookAdd,
    infoDel,
  }
};


function setAboutMessage(_, { message }) {
  return aboutMessage = message;
}


async function bookList() {
  const books = await db.collection('books').find({}).toArray();
  return books;
} 

async function userList() {
  const users = await db.collection('users').find({}).toArray();
  return users;
} 

async function loanList() {
  const loans = await db.collection('loans').find({}).toArray();
  return loans;
} 

async function currentuser() {
  const currentuser = await db.collection('currentuser').find({}).toArray();
  return currentuser;
}


async function userLogin(_, { user }) {
  const userlogin = await db.collection('users').findOne({username:user.username, password:user.password});
  if(userlogin){
    await db.collection('currentuser').remove({})
    await db.collection('currentuser').insertOne(userlogin)
  }
  return userlogin;
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}


async function userValidate(user) {
  const errors = [];
  if (user.username==""||user.phone==""||user.password==""||user.email==""||user.name==""||user.gender=="") {
    errors.push('Please fill the blanks.');
  }
  const username = await db.collection('users').findOne({username:user.username})
  if (username){
    errors.push('The username already exist, please enter another username.');
  }

  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}



async function userAdd(_, { user }) {
  await userValidate(user)
  user.id = await getNextSequence('users');
  const result = await db.collection('users').insertOne(user);
  const savedUser = await db.collection('users')
    .findOne({ _id: result.insertedId });
  return savedUser;
}


async function bookAdd(_, { book }) {
  const number=parseInt(book.number)
  const data = await db.collection('books').findOne({title:book.title,author:book.author,publisher:book.publisher});
  if(data){
    const total = data.total+number
    const avail = data.avail+number
    await db.collection('books').updateOne({ title:book.title,author:book.author,publisher:book.publisher },
       { $set: {total: total, avail:avail} })
  }
  else{
    book.id = await getNextSequence('books');
    book.total=number
    const result = await db.collection('books').insertOne({id:book.id,total:book.total,author:book.author,
      publisher:book.publisher,title:book.title,avail:number,image:book.image});
    const savedBook = await db.collection('books')
    .findOne({ _id: result.insertedId });
    return savedBook;
  }
}

async function removeSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: -1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}



async function bookDelete(_, { book }) {
  const number=parseInt(book.number)
  const data = await db.collection('books').findOne({title:book.title,author:book.author,publisher:book.publisher});
  if(!data){
    throw new UserInputError("Book don't exist. Please enter the right book.");
  }
  else{
    if(data.avail<number){
      throw new UserInputError("Delete book number is larger\
      than the available book number. Please enter the right number");
  }
  else{
    const total=data.total-number
    const avail = data.avail-number
    if(total==0){
      const index=data.id;
      await db.collection('books').deleteOne({title: book.title,author:book.author,publisher:book.publisher});
      const number= await removeSequence('books'); 
      await db.collection('books').updateMany({id:{$gt:index}},{$inc:{id:-1}});

    }
    else{
      await db.collection('books').updateOne({ title: book.title,author:book.author,publisher:book.publisher }, 
        { $set: {total: total, avail:avail} })
    }
  }
    
  }
}

async function bookReturn(_, { loan }) {
  const data = await db.collection('loans').findOne({title:loan.title, reader:loan.reader});
  if(!data){
    throw new UserInputError("No reader loans this book. Please enter again.")
  }
  else if(!data.returndate){
    throw new UserInputError("This book has already returned. Please enter again.")
  }
  else{
    returndate = new Date();
    await db.collection('loans').updateOne({title:loan.title, reader:loan.reader}, 
      { $set: {returndate:returndate} })
    }
  }
    


async function userUpdate(_, { user }){
  const phone=user.phone
  const name=user.name
  const email=user.email
  const gender=user.gender
  const password=user.password
  
  if (phone){
      console.log(phone)
      await db.collection('users').updateOne({username:user.username}, 
        { $set: {phone:phone} })
      await db.collection('currentuser').updateOne({username:user.username}, 
        { $set: {phone:phone} })
    }
  
  if (name){
      console.log(name)
      await db.collection('users').updateOne({username:user.username}, 
        { $set: {name:name} })
      await db.collection('currentuser').updateOne({username:user.username}, 
        { $set: {name:name} })

  }

  if (email){
    console.log(email)
    await db.collection('users').updateOne({username:user.username}, 
      { $set: {email:email} })
    await db.collection('currentuser').updateOne({username:user.username}, 
      { $set: {email:email} })

  }


  if (gender){
    console.log(gender)
    await db.collection('users').updateOne({username:user.username}, 
      { $set: {gender:gender} })
    await db.collection('currentuser').updateOne({username:user.username}, 
      { $set: {gender:gender} })

  }

  if (password){
    console.log(password)
    await db.collection('users').updateOne({username:user.username}, 
      { $set: {password:password} })
    await db.collection('currentuser').updateOne({username:user.username}, 
      { $set: {password:password} })

  }
  
}
  
async function oldbookList() {
  const oldbooks = await db.collection('oldbooks').find({}).toArray();
  return oldbooks;
}

async function myinfoList() {
  const user = await db.collection('currentuser').find({}).toArray();
  const currentuser=user[0]
  const me=currentuser.username
  const oldbooks = await db.collection('oldbooks').find({username:me}).toArray();
  return oldbooks;
}

async function reviewList(_,{book}) {
  const reviews = await db.collection('reviews').find({title:book.title}).toArray();
  return reviews;
}


async function searchBook(_,{book}) {
  const books = await db.collection('books').find({title:{$regex:book.title}}).toArray();
  return books;
}

async function findOldBook(_,{book}) {
  const oldbooks = await db.collection('oldbooks').find({title:{$regex:book.title}}).toArray();
  return oldbooks;
}

async function loanAdd(_,{loan}) {
  loan.loandate= new Date();
  index=await getNextSequence("loans")
  loan.id=index
  const result = await db.collection('loans').insertOne(loan);
  const savedloan = await db.collection('loans')
    .findOne({ _id: result.insertedId });
  return savedloan;
}

async function oldbookAdd(_,{oldbook}) {
  const currentuser = await db.collection('currentuser').find({}).toArray();
  const user=currentuser[0]
  oldbook.username= user.username
  const result = await db.collection('oldbooks').insertOne(oldbook);
  const savedinfo = await db.collection('oldbooks')
    .findOne({ _id: result.insertedId });
  return savedinfo;
}

async function availDel(_,{book}) {
  await db.collection('books').updateOne({title:book.title},{$inc:{avail:-1}});
  
}

async function infoDel(_,{oldbook}) {
  await db.collection('oldbooks').deleteOne(oldbook);
  
}

async function reviewAdd(_,{review}) {
  review.created= new Date();
  const result = await db.collection('reviews').insertOne(review);
  const savedreview = await db.collection('reviews')
    .findOne({ _id: result.insertedId });
  return savedreview;
}



async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  },
});

const app = express();

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' });

(async function () {
  try {
    await connectToDb();
    app.listen(3000, function () {
      console.log('App started on port 3000');
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
})();