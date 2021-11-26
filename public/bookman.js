const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

function BookRow(props) {
  const book = props.book;
  return /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, book.id), /*#__PURE__*/React.createElement("td", null, book.title), /*#__PURE__*/React.createElement("td", null, book.author), /*#__PURE__*/React.createElement("td", null, book.publisher), /*#__PURE__*/React.createElement("td", null, book.total), /*#__PURE__*/React.createElement("td", null, book.avail));
}

function BookTable(props) {
  const bookRows = props.books.map(book => /*#__PURE__*/React.createElement(BookRow, {
    key: book.id,
    book: book
  }));
  return /*#__PURE__*/React.createElement("table", {
    className: "bordered-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Serial No."), /*#__PURE__*/React.createElement("th", null, "Title"), /*#__PURE__*/React.createElement("th", null, "Author"), /*#__PURE__*/React.createElement("th", null, "Publisher"), /*#__PURE__*/React.createElement("th", null, "Total Number"), /*#__PURE__*/React.createElement("th", null, "Available Number"))), /*#__PURE__*/React.createElement("tbody", null, bookRows));
}

class BookAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.bookAdd;

    if (form.title.value == "" || form.publisher.value == "" || form.author.value == "" || form.number.value == "") {
      alert('Please fill in the blanks.');
    } else {
      const book = {
        title: form.title.value,
        publisher: form.publisher.value,
        author: form.author.value,
        number: form.number.value,
        image: form.image.value
      };
      this.props.addBook(book);
      form.title.value = "";
      form.publisher.value = "";
      form.author.value = "";
      form.number.value = "";
      form.image.value = "";
    }
  }

  render() {
    return /*#__PURE__*/React.createElement("form", {
      name: "bookAdd",
      onSubmit: this.handleSubmit
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "title",
      placeholder: "Title"
    }), "\u2003", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "author",
      placeholder: "Author"
    }), "\u2003", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "publisher",
      placeholder: "Publisher"
    }), "\u2003", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "number",
      placeholder: "Number"
    }), "\u2003", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "image",
      placeholder: "Image Link"
    }), "\u2003", /*#__PURE__*/React.createElement("button", null, "Add"));
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

    if (form.title.value == "" || form.publisher.value == "" || form.author.value == "" || form.number.value == "") {
      alert('Please fill in the blanks.');
    } else {
      const book = {
        title: form.title.value,
        publisher: form.publisher.value,
        author: form.author.value,
        number: form.number.value
      };
      this.props.deleteBook(book);
      form.title.value = "";
      form.publisher.value = "";
      form.author.value = "";
      form.number.value = "";
    }
  }

  render() {
    return /*#__PURE__*/React.createElement("form", {
      name: "bookDelete",
      onSubmit: this.handleSubmit
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "title",
      placeholder: "Title"
    }), "\u2003", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "author",
      placeholder: "Author"
    }), "\u2003", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "publisher",
      placeholder: "Publisher"
    }), "\u2003", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "number",
      placeholder: "Number"
    }), "\u2003", /*#__PURE__*/React.createElement("button", null, "Delete"));
  }

}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
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
    this.state = {
      books: []
    };
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
      this.setState({
        books: data.bookList
      });
    }
  }

  async addBook(book) {
    const query = `mutation bookAdd($book: BookInput1s!) {
      bookAdd(book: $book) {
        id
      }
    }`;
    const data = await graphQLFetch(query, {
      book
    });

    if (data) {
      this.loadData();
    }
  }

  async deleteBook(book) {
    const query = `mutation bookDelete($book: BookInput1s!) {
      bookDelete(book: $book) {
        id}
    }`;
    const data = await graphQLFetch(query, {
      book
    });

    if (data) {
      this.loadData();
    }
  }

  render() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(BookTable, {
      books: this.state.books
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(BookAdd, {
      addBook: this.addBook
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(BookDelete, {
      deleteBook: this.deleteBook
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("br", null));
  }

}

const element = /*#__PURE__*/React.createElement(BookList, null);
ReactDOM.render(element, document.getElementById('booklist'));