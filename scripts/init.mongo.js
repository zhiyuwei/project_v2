db.users.remove({});

const usersDB = [
    {id: 1,username:"Snow",password:"xxx", name: "Zhong Xiaoxue",phone:"11111111",email:"xiaoxue980111@outlook.com",gender:"female",person:"student"},
    {id: 2,username:"WZY",password:"xxx", name: "Wei Zhiyu",phone:"22222222",email:" e0686129@u.nus.edu",gender:"female",person:"staff"},
];

db.users.insertMany(usersDB);
const count = db.users.count();
print('Inserted', count, 'users');

db.counters.remove({ _id: 'users' });
db.counters.insert({ _id: 'users', current: count });

db.users.createIndex({ id: 1 }, { unique: true });
db.users.createIndex({ password: 1 });
db.users.createIndex({ name: 1 });

db.currentuser.remove({});

db.books.remove({});
const booksDB = [
      {
        id: 1, title: 'The equations of life : how physics shapes evolution',
        author: 'Cockell, Charles S.', place: 'New York, USA', date: '2018',
        publisher: 'Basic Books', intro: "Why do flocks of geese fly in graceful echelons? Why do animals have legs and not wheels? Why do burrowing moles look the same the world over?\
        The Equations of Life biologist Charles S. Cockell argues that the laws of physics narrowly constrain how life can evolve.\
        Despite the astounding diversity of living things on the planet, evolution’s outcomes are predictable at every level of life’s structure, from colonies of ants to the very atoms from which they are made.\
        Yet in this view, we can find a new appreciation for the beautiful simplicity and symmetry of life.",
        location:"Available at Main Library(4th floor)",
        total:3, avail:2,
      },
    {
            id: 2, title: 'Introduction to modern cryptography',
            author: 'Katz Jonathan, and Lindell Yehuda', place: 'Florida, USA', date: '2019',
            publisher: 'CRC Press', intro: "Providing a mathematically rigorous yet accessible treatment of this fascinating subject, this book’s focus is on modern cryptography, which is distinguished from classical cryptography by its emphasis on definitions, precise assumptions and rigorous proofs of security. A unique feature of this book is that it presents theoretical foundations with an eye toward understanding the latest cryptographic standards in wide use today.",
            location:"Available at Main Library(5th floor)",
            total:2, avail:0,
          }
    ];
    
db.books.insertMany(booksDB);
    
const count2 = db.books.count();
print('Inserted', count2, 'books');
    
db.counters.remove({ _id: 'books' });
db.counters.insert({ _id: 'books', current: count2});

db.books.createIndex({ id: 1 }, { unique: true });

db.loans.remove({});
var loanDB = [{id: 1,title: "The equations of life : how physics shapes evolution",
    reader: "Snow",loandate: new Date("2019-01-01"),returndate:new Date("2019-02-01")},
    {id: 2,title: "Introduction to modern cryptography",
    reader: "WZY",loandate: new Date("2019-01-05"),returndate:new Date("2019-01-11")},
    {id: 3,title: "Introduction to modern cryptography",
    reader: "Snow",loandate: new Date("2019-01-05"),returndate:new Date("2019-05-08")}
];

db.loans.insertMany(loanDB);
const count3 = db.loans.count();
print('Inserted', count3, 'loan records');

db.counters.remove({ _id: 'loans' });
db.counters.insert({ _id: 'loans', current: count3});

db.reviews.remove({});
const reviewDB=[
    {title:'The equations of life : how physics shapes evolution',
  name:'zhiyu',content:'Hi, just say something', created:new Date('2021-11-16')},
    {title:'The equations of life : how physics shapes evolution',
    name:'xiaoxue',content:'This book is good', created:new Date('2021-11-20')}
  ]
db.reviews.insertMany(reviewDB);

db.oldbooks.remove({});
const oldbookDB =[
  {title:'The equations of life : how physics shapes evolution',
  image:'https://i.ebayimg.com/images/g/jMoAAOSwkdFf-Krt/s-l300.jpg' ,
contact:'whatsapp: 92830427',price:20,username:'zhiyu'},
  {title:'Introduction to modern cryptography',
  image:'https://pictures.abebooks.com/inventory/md/md30769705569.jpg',
contact:'Tele: 82716273',price:10,username:'xiaoxue'}
]
db.oldbooks.insertMany(oldbookDB);

const count_o = db.oldbooks.count();
print('Inserted', count_o, 'second-hand book');

const count_r = db.reviews.count();
print('Inserted', count_r, 'reviews');