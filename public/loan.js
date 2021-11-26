const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

function LoanRow(props) {
  const loan = props.loan;
  return /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, loan.id), /*#__PURE__*/React.createElement("td", null, loan.title), /*#__PURE__*/React.createElement("td", null, loan.reader), /*#__PURE__*/React.createElement("td", null, loan.loandate.toDateString()), /*#__PURE__*/React.createElement("td", null, loan.returndate ? loan.returndate.toDateString() : ""));
}

function LoanTable(props) {
  const loanRows = props.loans.map(loan => /*#__PURE__*/React.createElement(LoanRow, {
    key: loan.id,
    loan: loan
  }));
  return /*#__PURE__*/React.createElement("table", {
    className: "bordered-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Serial No."), /*#__PURE__*/React.createElement("th", null, "Title"), /*#__PURE__*/React.createElement("th", null, "Reader"), /*#__PURE__*/React.createElement("th", null, "Loan Date"), /*#__PURE__*/React.createElement("th", null, "Return Date"))), /*#__PURE__*/React.createElement("tbody", null, loanRows));
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

class BookReturn extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.bookReturn;

    if (form.title.value == "" || form.reader.value == "") {
      alert('Please fill in the blanks.');
    } else {
      const loan = {
        title: form.title.value,
        reader: form.reader.value
      };
      this.props.returnBook(loan);
      form.title.value = "";
      form.reader.value = "";
    }
  }

  render() {
    return /*#__PURE__*/React.createElement("form", {
      name: "bookReturn",
      onSubmit: this.handleSubmit
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "title",
      placeholder: "Title"
    }), "\u2003", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "reader",
      placeholder: "Reader"
    }), "\u2003", /*#__PURE__*/React.createElement("button", null, "Return"));
  }

}

class LoanList extends React.Component {
  constructor() {
    super();
    this.state = {
      loans: []
    };
    this.returnBook = this.returnBook.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      loanList {
        id title reader loandate returndate
      }
    }`;
    const data = await graphQLFetch(query);

    if (data) {
      this.setState({
        loans: data.loanList
      });
    }
  }

  async returnBook(loan) {
    const query = `mutation bookReturn($loan: ReturnInputs!) {
      bookReturn(loan: $loan) {
        id
      }
    }`;
    const data = await graphQLFetch(query, {
      loan
    });

    if (data) {
      this.loadData();
    }
  }

  render() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(LoanTable, {
      loans: this.state.loans
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("center", null, /*#__PURE__*/React.createElement(BookReturn, {
      returnBook: this.returnBook
    })));
  }

}

const element = /*#__PURE__*/React.createElement(LoanList, null);
ReactDOM.render(element, document.getElementById('loanlist'));