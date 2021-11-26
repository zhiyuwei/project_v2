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
    const currentuser = this.props.user[0];
    const form = document.forms.UserEdit;
    const user = {
      username: currentuser.username,
      password: form.password.value,
      email: form.email.value,
      name: form.name.value,
      phone: form.phone.value,
      gender: form.gender.value,
      person: currentuser.person
    };
    this.props.updateUser(user);
    form.password.value = "";
    form.email.value = "";
    form.name.value = "";
    form.phone.value = "";
    form.gender.value = "";
  }

  render() {
    const user = this.props.user[0];
    return /*#__PURE__*/React.createElement("form", {
      action: "#",
      name: "UserEdit",
      onSubmit: this.handleSubmit
    }, /*#__PURE__*/React.createElement("table", {
      align: "center"
    }, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "left"
    }, "Username: "), /*#__PURE__*/React.createElement("td", {
      class: "right"
    }, user.username)), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "left"
    }, "Password"), /*#__PURE__*/React.createElement("td", {
      class: "right"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "password",
      id: "password",
      placeholder: user.password
    }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "left"
    }, "Email"), /*#__PURE__*/React.createElement("td", {
      class: "right"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "email",
      id: "email",
      placeholder: user.email
    }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "left"
    }, "Name"), /*#__PURE__*/React.createElement("td", {
      class: "right"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "name",
      id: "name",
      placeholder: user.name
    }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "left"
    }, "Phone"), /*#__PURE__*/React.createElement("td", {
      class: "right"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "phone",
      id: "phone",
      placeholder: user.phone
    }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "left"
    }, "Gender"), /*#__PURE__*/React.createElement("td", {
      class: "right"
    }, /*#__PURE__*/React.createElement("select", {
      id: "gender",
      name: "gender"
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }), /*#__PURE__*/React.createElement("option", {
      value: "male"
    }, "Male"), /*#__PURE__*/React.createElement("option", {
      value: "female"
    }, "Female")))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "left"
    }, "Person: "), /*#__PURE__*/React.createElement("td", {
      class: "right"
    }, user.person)), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "left"
    })), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: "2",
      align: "center"
    }, /*#__PURE__*/React.createElement("input", {
      type: "submit",
      name: "ret-sub",
      id: "ret-sub",
      value: "Submit"
    })))));
  }

}

class User extends React.Component {
  constructor() {
    super();
    this.state = {
      user: [],
      haveData: false
    };
    this.updateUser = this.updateUser.bind(this);
    this.loadData = this.loadData.bind(this);
  }

  async loadData() {
    const query = `query {
        currentuser {
            id username password name phone email gender person
        }
        }`;
    const data = await graphQLFetch(query);

    if (data) {
      this.setState({
        user: data.currentuser,
        haveData: true
      });
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
    const data = await graphQLFetch(query, {
      user
    });

    if (data) {
      alert("Successfully update!");
      this.loadData();
    }
  }

  render() {
    return !this.state.haveData ? "loading" : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(UserUpdate, {
      updateUser: this.updateUser,
      user: this.state.user
    }));
  }

}

const element = /*#__PURE__*/React.createElement(User, null);
ReactDOM.render(element, document.getElementById('usersetting'));