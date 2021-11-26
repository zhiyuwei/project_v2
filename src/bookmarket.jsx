const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
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

function Inforow(props){
    const oldbook=props.oldbook;
    return(
      <div className="oldbookinfo">
      <div>
      <img src={oldbook.image} height="50" width="80"/>
      <div>
        <div>{oldbook.title} </div>
        <div><span className="item-label">Price: </span><span>{oldbook.price}</span> </div>
        <div><span className="item-label">Contact: </span><span>{oldbook.contact}</span> </div>
        
      </div>
      </div>
      
    </div>
        
    );
}

function InfoTable(props){
    const inforows=props.oldbooks.map(oldbook=>
        <Inforow key={oldbook._id} oldbook={oldbook} />);
    return(
        <div className="infotable">
            {inforows}
        </div>
    )
}

class Search extends React.Component{
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.search;
    if (form.title.value==''){alert("Please enter a search term")}
    else
    {const book = {
      title: form.title.value,
    }
    this.props.searchbook(book);
    form.title.value = "";
    this.props.changeState('none');
  }}

  render() {
    return (
      <form className="keywordInput" name="search" onSubmit={this.handleSubmit}>
        <input type="text" name="title" placeholder="Title" />&emsp;  
        <button className="applybutton">Apply</button>
      </form>
    );
  }
}

class InfoMan extends React.Component{
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
}

  handleClick(e){
    e.preventDefault();
    this.props.changeState('block')
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.infoAdd;
    if (form.title.value=='') {alert("Please enter book title")}
    else if (form.contact.value==''){alert("Please enter contact")}
    else {
      const oldbook = {
      title: form.title.value, price: form.price.value,
      contact: form.contact.value, image:form.image.value
    }
    this.props.createInfo(oldbook);
    form.title.value = ""; form.price.value = "";
    form.contact.value = "";form.image.value = ""
    }
  }

  manage(){
    window.location.href = "manage.html"
  }

  render() {
    return (
      <div className="twobuttons">
        <hr />
        <button onClick={this.handleClick}>Post Second-hand Book</button> &emsp;  &emsp;  
        <button onClick={this.manage}>Manage My Post</button>
        <form name="infoAdd" onSubmit={this.handleSubmit} style={{display: this.props.formdisplay}}>
            Book Name: <input type='text' className="forminput" name='title' placeholder="Book Name" /><br />
            Price: <input type='text' className="forminput" name='price' placeholder="Price" /><br />
            Contact: <input type='text' className="forminput" name='contact' placeholder="Contact" /><br />
            Image Link: <input type='text' className="forminput" name='image' placeholder="Image Link" /><br />
            <button>Post</button>
        </form>
      </div>
    );
  }
}

class InfoList extends React.Component {
    constructor() {
        super();
        this.state = { oldbooks: [], formdisplay:'none' };
        this.changeState = this.changeState.bind(this);
        this.createInfo = this.createInfo.bind(this);
        this.searchbook=this.searchbook.bind(this)
        
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
          this.setState({ oldbooks: data.oldbookList });
        }
      }

      async createInfo(oldbook){
        const query = `mutation oldbookAdd($oldbook: OldbookInput!) {
          oldbookAdd(oldbook: $oldbook) {
            username
          }
        }`;
    
        const data = await graphQLFetch(query, { oldbook });
        if (data) {
        this.loadData();
      }
      }

      async searchbook(book){
        const query = `query findOldBook($book: BookInputs!){
          findOldBook(book: $book) {
            _id title image contact price username
          }
        }`;
    
        const data = await graphQLFetch(query,{book});
        if (data){
          const result=data.findOldBook
          if (result.length==0){alert("No results found")}
          this.setState({ oldbooks: result });
        }
      }

      

      changeState(somevalue){
        this.setState({formdisplay: somevalue});
      }

    render() {
      return (
        <React.Fragment>
        <Search oldbooks={this.state.oldbooks} searchbook={this.searchbook}
        changeState={this.changeState} />
        <InfoMan oldbooks={this.state.oldbooks} formdisplay={this.state.formdisplay}
        changeState={this.changeState} createInfo={this.createInfo}/>
        <hr />
        <InfoTable oldbooks={this.state.oldbooks}/>
      </React.Fragment>
      );
    }
  }
  


  const element = <InfoList />;

  ReactDOM.render(element, document.getElementById('bookmarket'));