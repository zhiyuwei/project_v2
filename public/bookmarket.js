const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
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

function Inforow(props) {
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

function InfoTable(props) {
  const inforows = props.oldbooks.map(oldbook => /*#__PURE__*/React.createElement(Inforow, {
    key: oldbook._id,
    oldbook: oldbook
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "infotable"
  }, inforows);
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
      form.title.value = "";
      this.props.changeState('none');
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
    }), "\u2003 \xA0", /*#__PURE__*/React.createElement("button", {
      className: "applybutton"
    }, "Apply"));
  }

}

class InfoMan extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.props.changeState('block');
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.infoAdd;

    if (form.title.value == '') {
      alert("Please enter book title");
    } else if (form.contact.value == '') {
      alert("Please enter contact");
    } else {
      const oldbook = {
        title: form.title.value,
        price: form.price.value,
        contact: form.contact.value,
        image: form.image.value
      };
      this.props.createInfo(oldbook);
      form.title.value = "";
      form.price.value = "";
      form.contact.value = "";
      form.image.value = "";
    }
  }

  manage() {
    window.location.href = "manage.html";
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "twobuttons"
    }, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("button", {
      onClick: this.handleClick
    }, "Post Second-hand Book"), " \u2003 \xA0\u2003 \xA0", /*#__PURE__*/React.createElement("button", {
      onClick: this.manage
    }, "Manage My Post"), /*#__PURE__*/React.createElement("form", {
      name: "infoAdd",
      onSubmit: this.handleSubmit,
      style: {
        display: this.props.formdisplay
      }
    }, "Book Name: ", /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "forminput",
      name: "title",
      placeholder: "Book Name"
    }), /*#__PURE__*/React.createElement("br", null), "Price: ", /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "forminput",
      name: "price",
      placeholder: "Price"
    }), /*#__PURE__*/React.createElement("br", null), "Contact: ", /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "forminput",
      name: "contact",
      placeholder: "Contact"
    }), /*#__PURE__*/React.createElement("br", null), "Image Link: ", /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "forminput",
      name: "image",
      placeholder: "Image Link"
    }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("button", null, "Post")));
  }

}

class InfoList extends React.Component {
  constructor() {
    super();
    this.state = {
      oldbooks: [],
      formdisplay: 'none'
    };
    this.changeState = this.changeState.bind(this);
    this.createInfo = this.createInfo.bind(this);
    this.searchbook = this.searchbook.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
            oldbookList {
            _id title image contact price username
          }
        }`;
    const data = await graphQLFetch(query);

    if (data) {
      this.setState({
        oldbooks: data.oldbookList
      });
    }
  }

  async createInfo(oldbook) {
    const query = `mutation oldbookAdd($oldbook: OldbookInput!) {
          oldbookAdd(oldbook: $oldbook) {
            username
          }
        }`;
    const data = await graphQLFetch(query, {
      oldbook
    });

    if (data) {
      this.loadData();
    }
  }

  async searchbook(book) {
    const query = `query findOldBook($book: BookInputs!){
          findOldBook(book: $book) {
            _id title image contact price username
          }
        }`;
    const data = await graphQLFetch(query, {
      book
    });

    if (data) {
      const result = data.findOldBook;

      if (result.length == 0) {
        alert("No results found");
      }

      this.setState({
        oldbooks: result
      });
    }
  }

  changeState(somevalue) {
    this.setState({
      formdisplay: somevalue
    });
  }

  render() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Search, {
      oldbooks: this.state.oldbooks,
      searchbook: this.searchbook,
      changeState: this.changeState
    }), /*#__PURE__*/React.createElement(InfoMan, {
      oldbooks: this.state.oldbooks,
      formdisplay: this.state.formdisplay,
      changeState: this.changeState,
      createInfo: this.createInfo
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(InfoTable, {
      oldbooks: this.state.oldbooks
    }));
  }

}

const element = /*#__PURE__*/React.createElement(InfoList, null);
ReactDOM.render(element, document.getElementById('bookmarket'));