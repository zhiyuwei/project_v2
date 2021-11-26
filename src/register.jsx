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



class UserAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.UserAdd;
    const user = {
      username: form.username.value, password: form.password.value,
      email: form.email.value, name: form.name.value,
      phone: form.phone.value, gender: form.gender.value,
      person:"student",
    }
    this.props.createUser(user);
    form.username.value = ""; form.password.value = "";
    form.email.value= ""; form.name.value= "";
    form.phone.value= "";form.gender.value= "";
  }

  render() {
    return (
        <form action="#" name="UserAdd" onSubmit={this.handleSubmit}>
        <table>
            <br />
            <br />
            <tr>
                <td class="td_left"><label for="username">USERNAME</label></td>
                <td class="td_right"><input type="text" name="username" id="username" placeholder="Please enter username" /></td>
            </tr>
            <tr>
                <td class="td_left"><label for="password">PASSWORD</label></td>
                <td class="td_right"><input type="text" name="password" id="password" placeholder="Please enter password" /></td>
            </tr>
            <tr>
                <td class="td_left"><label for="email">EMAIL</label></td>
                <td class="td_right"><input type="text" name="email" id="email" placeholder="Please enter email" /></td>
            </tr>
            <tr>
                <td class="td_left"><label for="name">NAME</label></td>
                <td class="td_right"><input type="text" name="name" id="name" placeholder="Please enter real name" /></td>
            </tr>
            <tr>
                <td class="td_left"><label for="phone">PHONE</label></td>
                <td class="td_right"><input type="text" name="phone" id="phone" placeholder="Please enter telephone number" /></td>
            </tr>
            <tr>
                <td class="td_left"><label>GENDER</label></td>
                <td class="td_right">
                    <select id="gender" name="gender">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    </select>
                </td>
            </tr>
            
            <tr>
                <td class="td_left"></td>
            </tr>
            
            <tr>
                <td colspan="2" align="center"><input type="submit" id="reg-sub" value="register" /></td>
            </tr>
        </table>
        </form>
    );
  }
}
  

class User extends React.Component {
    constructor() {
      super();
      this.createUser = this.createUser.bind(this);
    }
  
    async createUser(user) {
        const query = `mutation userAdd($user: UserInputs!)  {
            userAdd(user: $user){
            id
        }
    }`;

        const data = await graphQLFetch(query, {user});

        if(data){
        alert("Successfully registered!")
        }
    }
  
  
    render() {
      return (
        <React.Fragment>
          <UserAdd createUser={this.createUser} />
        </React.Fragment>
      );
    }
  }
  
  const element = <User />;
  
  ReactDOM.render(element, document.getElementById('register'));


