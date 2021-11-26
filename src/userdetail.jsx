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

function User(props){
  const user=props.user;

  return(
    <form action="#" className="userdetail">
        <table align="center">
        <tr>
            <td class="left">Username: </td><td class="right">{user.username}</td>
        </tr>
        <tr>
            <td  class="left">Password: </td><td class="right">{user.password}</td>
        </tr>
        <tr>
            <td class="left">Email: </td><td class="right">{user.email}</td>
        </tr>
        <tr>
            <td class="left" >Name: </td><td class="right">{user.name}</td>
        </tr>
        <tr>
            <td class="left" >Phone: </td><td class="right">{user.phone}</td>
        </tr>
        <tr>
            <td class="left">Gender: </td><td class="right">{user.gender}</td>
        </tr>
        <tr>
            <td class="left">Person: </td><td class="right">{user.person}</td>
        </tr>
        </table>
    </form>
  );
}


function UserTable(props){
    const userrows=props.user.map(user=>
      <User key={user.id} user={user}/>
      );
  
    return (
      <div>
        <hr />
        {userrows}
      </div>
    );
    
  }
  

class Userdetail extends React.Component {
    constructor() {
      super();
      this.state = { user: [] };
    }
  
    componentDidMount() {
      this.loadData();
    }
  
    async loadData() {
      const query = `query {
        currentuser {
          id username password name phone email gender person
        }
      }`;
  
      const data = await graphQLFetch(query);
      if (data) {
        this.setState({ user: data.currentuser });
      }
    }

    handleOut(){
      window.location.href = "usersetting.html";}
  
  
    render() {
      return (
        <React.Fragment>
          <UserTable user={this.state.user} />
          <br />
          <div onClick={this.handleOut} style={{width:"100%","text-align":"center"}}><button>Edit</button></div>
        </React.Fragment>
      );
    }
  }
  
  const element = <Userdetail />;
  
  ReactDOM.render(element, document.getElementById('userdetail'));

