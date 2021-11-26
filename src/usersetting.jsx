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



class UserUpdate extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    
  }

  handleSubmit(e) {
    e.preventDefault();
    const currentuser=this.props.user[0]

    const form = document.forms.UserEdit;
   
    const user = {
      username: currentuser.username, password: form.password.value,
      email: form.email.value, name: form.name.value,
      phone: form.phone.value, gender: form.gender.value,
      person:currentuser.person,
    }

    this.props.updateUser(user);
    form.password.value = "";
    form.email.value= ""; form.name.value= "";
    form.phone.value= ""; form.gender.value= "";
  }
  
  render() {
    const user=this.props.user[0]
    
    return (
        
        <form action="#" name="UserEdit" onSubmit={this.handleSubmit}>
        <table align="center">
            <br />

            <tr>
            <td class="left">Username: </td>
            <td class="right">{user.username}</td>
            </tr>

            <tr>
            <td class="left">Password</td>
            <td class="right"><input type="text" name="password" id="password" placeholder={user.password} /></td>
            </tr>

            <tr>
            <td class="left">Email</td>
            <td class="right"><input type="text" name="email" id="email" placeholder={user.email} /></td>
            </tr>
            
            <tr>
            <td class="left">Name</td>
            <td class="right"><input type="text" name="name" id="name" placeholder={user.name} /></td>
            </tr>
        
            <tr>
            <td class="left">Phone</td>
            <td class="right"><input type="text" name="phone" id="phone" placeholder={user.phone}  /></td>
            </tr>

            <tr>
            <td class="left">Gender</td>
            <td class="right"><select id="gender" name="gender">
                <option value=""></option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select></td>
            </tr>

            <tr>
            <td class="left">Person: </td>
            <td class="right">{user.person}</td>
            </tr>

            <tr>
            <td class="left"></td>
            </tr>

            <tr>
            <td colSpan="2" align="center"><input type="submit" name="ret-sub" id="ret-sub" value="Submit" /></td>
            </tr>

        </table>
        </form>
    );
  }
}
  

class User extends React.Component {
    constructor() {
      super();
      this.state = { user: [],haveData:false };
      this.updateUser = this.updateUser.bind(this);
      this.loadData =this.loadData.bind(this)
    }
    
    

    async loadData() {
        const query = `query {
        currentuser {
            id username password name phone email gender person
        }
        }`;

        const data = await graphQLFetch(query);
        if (data) {
        this.setState({ user: data.currentuser, haveData:true});
        }
    }

    componentDidMount() {
        this.loadData();
      }

    async updateUser(user) {
        const query = `mutation userUpdate($user: UserUpdate!)  {
            userUpdate(user: $user){
            id
        }
    }`;

        const data = await graphQLFetch(query, {user});

        if(data){
          alert("Successfully update!")
          this.loadData();
        }
    }
  
  
    render() {
    
      return (
        !this.state.haveData?"loading":(
        
        <React.Fragment>
          <UserUpdate updateUser={this.updateUser} user={this.state.user}/>
        </React.Fragment>)
      );
    }
    
  }
  
  const element = <User />;
  
  ReactDOM.render(element, document.getElementById('usersetting'));


