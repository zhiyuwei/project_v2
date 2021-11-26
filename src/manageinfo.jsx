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

  
class Inforow extends React.Component{
    constructor() {
        super();
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(e){
      e.preventDefault();
      const oldbook=this.props.oldbook;
      this.props.deleteinfo(oldbook)
      alert("Successfully deleted")
    }
    render(){
    const oldbook=this.props.oldbook;
    return(
        <div className="infoblock">
            <button onClick={this.handleClick}>Delete</button>
            <img src={oldbook.image} />
            <div>{oldbook.title}</div>
            <div><span className="item-label">Price:</span> {oldbook.title}</div>
            <div><span className="item-label">Contact:</span> {oldbook.contact}</div>
        </div>
        
    );
    }
}

class InfoTable extends React.Component{
    constructor() {
        super();
    }
    render(){
    const inforows=this.props.oldbooks.map(oldbook=>
        <Inforow key={oldbook.title} oldbook={oldbook} 
        deleteinfo={this.props.deleteinfo}/>);
    return(
        <div>
            {inforows}
        </div>
    )
    }
}

class InfoAdd extends React.Component{
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
  
    render() {
      return (
        <div className="postform">
          <button onClick={this.handleClick}>Post Second-hand Book</button>
          <form name="infoAdd" onSubmit={this.handleSubmit} style={{display: this.props.formdisplay}}>
          Book Name:<input type='text' className="forminput" name='title' placeholder="Book Name" /><br />
          Price:<input type='text' className="forminput" name='price' placeholder="Price" /><br />
          Contact:<input type='text' className="forminput" name='contact' placeholder="Contact" /><br />
          Image Link:<input type='text' className="forminput" name='image' placeholder="Image Link" /><br />
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
        this.deleteinfo=this.deleteinfo.bind(this);
        
      }
    
      componentDidMount() {
        this.loadData();
      }
    
      async loadData() {
        const query = `query {
            myinfoList {
            title image contact price username
          }
        }`;
    
        const data = await graphQLFetch(query);
        if (data) {
          this.setState({ oldbooks: data.myinfoList });
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

      async deleteinfo(oldbook){
        const query = `mutation infoDel($oldbook: OldbookInput!) {
            infoDel(oldbook: $oldbook) {
              username
            }
          }`;
      
          const data = await graphQLFetch(query, { oldbook });
          if (data) {
          this.loadData();
            }
      }

      changeState(somevalue){
        this.setState({formdisplay: somevalue});
      }

    render() {
      return (
        <React.Fragment>
        <InfoAdd oldbooks={this.state.oldbooks} formdisplay={this.state.formdisplay}
        changeState={this.changeState} createInfo={this.createInfo}/>
        <hr />
        <InfoTable oldbooks={this.state.oldbooks} deleteinfo={this.deleteinfo}/>
      </React.Fragment>
      );
    }
  }


const element = <InfoList />;

ReactDOM.render(element, document.getElementById('myinfolist'));