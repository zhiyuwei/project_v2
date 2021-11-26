const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}


function BookRow(props) {
  const book = props.book;
  return (
    <tr>
        <td>{book.id}</td>
        <td>{book.title}</td>
        <td>{book.author}</td>
        <td>{book.publisher}</td>
        <td>{book.total}</td>
        <td>{book.avail}</td>
    </tr>
  );
}

function BookTable(props) {
  const bookRows = props.books.map(book =>
    <BookRow key={book.id} book={book} />
  );

  return (
    <table className="bordered-table">
        <thead>
          <tr>
            <th>Serial No.</th>
            <th>Title</th>
            <th>Author</th>
            <th>Publisher</th>
            <th>Total Number</th>
            <th>Available Number</th>
          </tr>
        </thead>
        <tbody>
          {bookRows}
        </tbody>
    </table>
  );
}



class BookAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.bookAdd;
    if (form.title.value==""||form.publisher.value==""||form.author.value==""||form.number.value=="") {
      alert('Please fill in the blanks.');
    }
    else{
      const book = {
        title: form.title.value, publisher: form.publisher.value,
        author: form.author.value, number:form.number.value,
        image:form.image.value,
      }
      this.props.addBook(book);
      form.title.value = ""; form.publisher.value = "";
      form.author.value = ""; form.number.value = "";
      form.image.value = "";
    }
    
  }

  render() {
    return (
      
      <form name="bookAdd" onSubmit={this.handleSubmit}>
        <input type="text" name="title" placeholder="Title" />&emsp;  
        <input type="text" name="author" placeholder="Author" />&emsp;
        <input type="text" name="publisher" placeholder="Publisher" />&emsp;
        <input type="text" name="number" placeholder="Number" />&emsp;
        <input type="text" name="image" placeholder="Image Link" />&emsp;
        <button>Add</button>
      </form>
    );
  }
}

class BookDelete extends React.Component {

  constructor() {
  super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.bookDelete;
    if (form.title.value==""||form.publisher.value==""||form.author.value==""||form.number.value=="") {
      alert('Please fill in the blanks.');
    }
    else{
      const book = {
        title: form.title.value, publisher: form.publisher.value,
        author: form.author.value, number:form.number.value,
      }
      this.props.deleteBook(book);
      form.title.value = ""; form.publisher.value = "";
      form.author.value = ""; form.number.value = "";

    }
    
}

render() {
  return (
    <form name="bookDelete" onSubmit={this.handleSubmit}>
        <input type="text" name="title" placeholder="Title" />&emsp;  
        <input type="text" name="author" placeholder="Author" />&emsp;
        <input type="text" name="publisher" placeholder="Publisher" />&emsp;
        <input type="text" name="number" placeholder="Number" />&emsp;
        <button>Delete</button>
      </form>
  );
}
}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ query, variables })
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code == 'BAD_USER_INPUT') {
        
        alert(`${error.message}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}

class BookList extends React.Component {
  constructor() {
    super();
    this.state = { books: [] };
    this.addBook = this.addBook.bind(this);
    this.deleteBook = this.deleteBook.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      bookList {
        id title total author publisher avail
      }
    }`;

    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ books: data.bookList });
    }
  }

  async addBook(book) {
    const query = `mutation bookAdd($book: BookInput1s!) {
      bookAdd(book: $book) {
        id
      }
    }`;

    const data = await graphQLFetch(query, { book });

    if (data) {
      this.loadData();
    }
  }

  async deleteBook(book) {
    const query = `mutation bookDelete($book: BookInput1s!) {
      bookDelete(book: $book) {
        id}
    }`;

    const data = await graphQLFetch(query,{ book });
    if (data) {
      this.loadData();
    }
  }
  

  render() {
    return (
      <React.Fragment>
        <hr />
        <BookTable books={this.state.books} />
        <hr />
        <BookAdd addBook={this.addBook} />
        <hr />
        <BookDelete deleteBook={this.deleteBook}/>
        <hr />
        <br /> 
      </React.Fragment>
    );
  }
}

const element = <BookList />;

ReactDOM.render(element, document.getElementById('booklist'));