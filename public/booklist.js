const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

class Onebook extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const book = this.props.book;
    this.props.detailbook(book);
    this.props.changepagestate('details');
    this.props.loadreview(book);
    this.props.loadoldbook(book);
  }

  render() {
    const book = this.props.book;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "listbody"
    }, /*#__PURE__*/React.createElement("img", {
      className: "bookcover",
      src: book.image,
      height: "200",
      width: "150"
    }), /*#__PURE__*/React.createElement("div", {
      className: "bookdetail"
    }, /*#__PURE__*/React.createElement("div", {
      className: "title"
    }, book.title, " ", /*#__PURE__*/React.createElement("button", {
      onClick: this.handleSubmit
    }, "Detail")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "item-label"
    }, "Author:"), /*#__PURE__*/React.createElement("span", null, " ", book.author)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "item-label"
    }, "Publication Place:"), /*#__PURE__*/React.createElement("span", null, book.place)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "item-label"
    }, "Publication Date:"), /*#__PURE__*/React.createElement("span", null, book.date)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "item-label"
    }, "Publisher:"), /*#__PURE__*/React.createElement("span", null, book.publisher)), /*#__PURE__*/React.createElement("div", {
      className: "introduction"
    }, /*#__PURE__*/React.createElement("span", {
      className: "item-label"
    }, "Introduction:"), /*#__PURE__*/React.createElement("span", null, book.intro)))), /*#__PURE__*/React.createElement("hr", null));
  }

}

class BookTable extends React.Component {
  constructor() {
    super();
  }

  render() {
    const bookrows = this.props.books.map(book => /*#__PURE__*/React.createElement(Onebook, {
      key: book.id,
      book: book,
      reviews: this.props.reviews,
      detailbook: this.props.detailbook,
      changepagestate: this.props.changepagestate,
      loadreview: this.props.loadreview,
      loadoldbook: this.props.loadoldbook
    }));
    return /*#__PURE__*/React.createElement("div", {
      className: "listbody",
      style: {
        display: this.props.bookshow
      }
    }, /*#__PURE__*/React.createElement("hr", null), bookrows);
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
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }

    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}

class Search extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.search;

    if (form.title.value == '') {
      alert("Please enter a search term");
    } else {
      const book = {
        title: form.title.value
      };
      this.props.searchbook(book);
      this.props.changepagestate('search');
      form.title.value = "";
    }
  }

  render() {
    return /*#__PURE__*/React.createElement("form", {
      className: "keywordInput",
      name: "search",
      onSubmit: this.handleSubmit
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "title",
      placeholder: "Title"
    }), " \u2003 \xA0", /*#__PURE__*/React.createElement("button", {
      className: "applybutton"
    }, "Apply"));
  }

}

function Oldbookrow(props) {
  const oldbook = props.oldbook;
  return /*#__PURE__*/React.createElement("div", {
    className: "oldbookinfo"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: oldbook.image,
    height: "50",
    width: "80"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, oldbook.title, " "), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "item-label"
  }, "Price: "), /*#__PURE__*/React.createElement("span", null, oldbook.price), " "), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "item-label"
  }, "Contact: "), /*#__PURE__*/React.createElement("span", null, oldbook.contact), " "))));
}

function Reviewrow(props) {
  const review = props.review;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "upperreview"
  }, review.name, /*#__PURE__*/React.createElement("span", {
    className: "created"
  }, review.created.toDateString()), /*#__PURE__*/React.createElement("div", {
    className: "commentcontent"
  }, /*#__PURE__*/React.createElement("div", {
    className: "reviewcon"
  }, review.content))), /*#__PURE__*/React.createElement("hr", null));
}

class Bookdetail extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.submitborrow = this.submitborrow.bind(this);
  }

  handleOut() {
    window.location.href = "secondBookMarket.html";
  }

  handleSubmit(e) {
    e.preventDefault();
    const book = this.props.detailedbook;
    const currentuser = this.props.currentuser[0];
    const form = document.forms.review;

    if (form.content.value == '') {
      alert("Please enter content");
    } else {
      const review = {
        title: book.title,
        name: currentuser.username,
        content: form.content.value
      };
      this.props.submitreview(book, review);
      form.content.value = "";
      alert("Comment successfully!");
    }
  }

  submitborrow(e) {
    e.preventDefault();
    const book = this.props.detailedbook;

    if (book.avail == 0) {
      alert("No available books now");
    } else {
      const currentuser = this.props.currentuser[0];
      const loan = {
        title: book.title,
        reader: currentuser.username,
        loandate: new Date()
      };
      this.props.updateloan(loan, book);
      alert("Record successfully! You can take the book.");
    }
  }

  render() {
    const book = this.props.detailedbook;
    const reviewrows = this.props.reviews.map(review => /*#__PURE__*/React.createElement(Reviewrow, {
      key: review.content,
      review: review
    }));
    const oldbookrow = this.props.oldbooks.map(oldbook => /*#__PURE__*/React.createElement(Oldbookrow, {
      key: oldbook.username,
      oldbook: oldbook
    }));
    return /*#__PURE__*/React.createElement("div", {
      className: "detail_text",
      style: {
        display: this.props.detailshow
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "detailblock"
    }, /*#__PURE__*/React.createElement("div", {
      className: "title"
    }, book.title), /*#__PURE__*/React.createElement("img", {
      className: "bookcover",
      src: book.image,
      height: "200",
      width: "150"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "item-label"
    }, "Author:"), /*#__PURE__*/React.createElement("span", null, " ", book.author)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "item-label"
    }, "Publication Place:"), /*#__PURE__*/React.createElement("span", null, book.place)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "item-label"
    }, "Publication Date:"), /*#__PURE__*/React.createElement("span", null, book.date)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "item-label"
    }, "Publisher:"), /*#__PURE__*/React.createElement("span", null, book.publisher)), /*#__PURE__*/React.createElement("div", {
      className: "introduction"
    }, /*#__PURE__*/React.createElement("span", {
      className: "item-label"
    }, "Introduction:"), /*#__PURE__*/React.createElement("span", null, book.intro)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "item-label"
    }, "location:"), /*#__PURE__*/React.createElement("span", null, book.location)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Total:"), /*#__PURE__*/React.createElement("span", null, book.total), /*#__PURE__*/React.createElement("span", null, " | Available:"), /*#__PURE__*/React.createElement("span", null, book.avail), /*#__PURE__*/React.createElement("hr", null))), /*#__PURE__*/React.createElement("div", {
      className: "detailblock"
    }, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("h3", null, "Borrow book"), /*#__PURE__*/React.createElement("button", {
      onClick: this.submitborrow
    }, "Borrow")), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("div", {
      className: "detailblock"
    }, /*#__PURE__*/React.createElement("h3", null, "Reviews"), reviewrows, /*#__PURE__*/React.createElement("form", {
      name: "review",
      onSubmit: this.handleSubmit
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "content",
      placeholder: "Comment..."
    }), /*#__PURE__*/React.createElement("button", null, "Comment"))), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("div", {
      className: "detailblock",
      onClick: this.handleOut
    }, /*#__PURE__*/React.createElement("h3", null, "Find Second-hand Book Here"), oldbookrow));
  }

}

class Booklist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      books: [],
      bookshow: 'block',
      pagestate: 'all',
      detailshow: 'none',
      detailedbook: {
        title: ''
      },
      reviews: [],
      oldbooks: [],
      currentuser: []
    };
    this.changepagestate = this.changepagestate.bind(this);
    this.searchbook = this.searchbook.bind(this);
    this.detailbook = this.detailbook.bind(this);
    this.submitreview = this.submitreview.bind(this);
    this.loadreview = this.loadreview.bind(this);
    this.loadoldbook = this.loadoldbook.bind(this);
    this.loaduser = this.loaduser.bind(this);
    this.updateloan = this.updateloan.bind(this);
  }

  componentDidMount() {
    this.loadData();
    this.loaduser();
  }

  async loadData() {
    const query = `query {
    bookList {
      id title image author place date publisher intro location
      total avail
    }
  }`;
    const data = await graphQLFetch(query);

    if (data) {
      const result = data.bookList;

      if (result == []) {
        alert("No results found");
      } else {
        this.setState({
          books: result
        });
      }
    }
  }

  async loaduser() {
    const query = `query {
      currentuser{
        username
      }
    }`;
    const data = await graphQLFetch(query);

    if (data) {
      this.setState({
        currentuser: data.currentuser
      });
    }
  }

  async updateloan(loan, book) {
    const query = `mutation loanAdd($loan: LoanInputs!) {
      loanAdd(loan: $loan) {
        reader
      }
    }`;
    const updatequery = `mutation availDel($book: BookInputs!) {
      availDel(book: $book) {
        title
      }
    }`;
    await graphQLFetch(query, {
      loan
    });
    const data = await graphQLFetch(updatequery, {
      book
    });

    if (data) {
      this.loadData();
      const detailedbook = this.state.detailedbook;
      detailedbook.avail -= 1;
      this.setState({
        detailedbook: detailedbook
      });
    }
  }

  async searchbook(book) {
    const query = `query searchBook($book: BookInputs!){
      searchBook(book: $book) {
        id title image author place date publisher intro location
        total avail
      }
    }`;
    const data = await graphQLFetch(query, {
      book
    });

    if (data) {
      const result = data.searchBook;

      if (result.length == 0) {
        alert("No results found");
      }

      this.setState({
        books: result
      });
    }
  }

  detailbook(book) {
    this.setState({
      detailedbook: book,
      bookshow: 'none',
      detailshow: 'block'
    });
  }

  async loadreview(book) {
    const query = `query reviewList($book: BookInputs!){
      reviewList (book: $book){
        title name content created
      }
    }`;
    const data = await graphQLFetch(query, {
      book
    });

    if (data) {
      this.setState({
        reviews: data.reviewList
      });
    }
  }

  async loadoldbook(book) {
    const query = `query findOldBook($book: BookInputs!){
      findOldBook (book: $book){
        title image contact price username
      }
    }`;
    const data = await graphQLFetch(query, {
      book
    });

    if (data) {
      this.setState({
        oldbooks: data.findOldBook
      });
    }
  }

  async submitreview(book, review) {
    const query = `mutation reviewAdd($review: ReviewInputs!) {
      reviewAdd(review: $review) {
        title name content created
      }
    }`;
    const data = await graphQLFetch(query, {
      review
    });

    if (data) {
      this.loadreview(book);
    }
  }

  changepagestate(somevalue) {
    this.setState({
      pagestate: somevalue
    });
  }

  render() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Search, {
      books: this.state.books,
      changepagestate: this.changepagestate,
      searchbook: this.searchbook
    }), /*#__PURE__*/React.createElement(BookTable, {
      books: this.state.books,
      detailbook: this.detailbook,
      changepagestate: this.changepagestate,
      bookshow: this.state.bookshow,
      loadreview: this.loadreview,
      reviews: this.state.reviews,
      loadoldbook: this.loadoldbook
    }), /*#__PURE__*/React.createElement(Bookdetail, {
      detailedbook: this.state.detailedbook,
      bookshow: this.state.bookshow,
      detailshow: this.state.detailshow,
      submitreview: this.submitreview,
      reviews: this.state.reviews,
      oldbooks: this.state.oldbooks,
      currentuser: this.state.currentuser,
      updateloan: this.updateloan
    }));
  }

}

const element = /*#__PURE__*/React.createElement(Booklist, null);
ReactDOM.render(element, document.getElementById('listbody'));