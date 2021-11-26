const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}


function LoanRow(props) {
  const loan=props.loan
  return (
    <tr>
        <td>{loan.id}</td>
        <td>{loan.title}</td>
        <td>{loan.reader}</td>
        <td>{loan.loandate.toDateString()}</td>
        <td>{loan.returndate?loan.returndate.toDateString():""}</td>
    </tr>
  );
}

function LoanTable(props) {
  const loanRows = props.loans.map(loan =>
    <LoanRow key={loan.id} loan={loan} />
  );

  return (
    <table className="bordered-table">
        <thead>
          <tr>
            <th>Serial No.</th>
            <th>Title</th>
            <th>Reader</th>
            <th>Loan Date</th>
            <th>Return Date</th>
          </tr>
        </thead>
        <tbody>
          {loanRows}
        </tbody>
    </table>
  );
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

class BookReturn extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.bookReturn;
    if (form.title.value==""||form.reader.value=="") {
      alert('Please fill in the blanks.');
    }
    else{
      const loan = {
        title: form.title.value, reader: form.reader.value,
      }
      this.props.returnBook(loan);
      form.title.value = ""; form.reader.value = "";
    }
    
  }

  render() {
    return (
      <form name="bookReturn" onSubmit={this.handleSubmit}>
        <input type="text" name="title" placeholder="Title" />&emsp;  
        <input type="text" name="reader" placeholder="Reader" />&emsp;
        <button>Return</button>
      </form>
    );
  }
}

class LoanList extends React.Component {
  constructor() {
    super();
    this.state = { loans: [] };
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
      this.setState({ loans: data.loanList });
    }
  }

  async returnBook(loan) {
    const query = `mutation bookReturn($loan: ReturnInputs!) {
      bookReturn(loan: $loan) {
        id
      }
    }`;

    const data = await graphQLFetch(query, { loan });
    if (data) {
      this.loadData();
    }
  }
  

  render() {
    return (
      <React.Fragment>
        <LoanTable loans={this.state.loans} />
        <hr />
        <center><BookReturn returnBook={this.returnBook} /></center>
      </React.Fragment>
    );
  }
}

const element = <LoanList />;

ReactDOM.render(element, document.getElementById('loanlist'));