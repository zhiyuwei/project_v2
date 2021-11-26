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

class UserAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.UserAdd;
    const user = {
      username: form.username.value,
      password: form.password.value,
      email: form.email.value,
      name: form.name.value,
      phone: form.phone.value,
      gender: form.gender.value,
      person: "student"
    };
    this.props.createUser(user);
    form.username.value = "";
    form.password.value = "";
    form.email.value = "";
    form.name.value = "";
    form.phone.value = "";
    form.gender.value = "";
  }

  render() {
    return /*#__PURE__*/React.createElement("form", {
      action: "#",
      name: "UserAdd",
      onSubmit: this.handleSubmit
    }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "td_left"
    }, /*#__PURE__*/React.createElement("label", {
      for: "username"
    }, "USERNAME")), /*#__PURE__*/React.createElement("td", {
      class: "td_right"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "username",
      id: "username",
      placeholder: "Please enter username"
    }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "td_left"
    }, /*#__PURE__*/React.createElement("label", {
      for: "password"
    }, "PASSWORD")), /*#__PURE__*/React.createElement("td", {
      class: "td_right"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "password",
      id: "password",
      placeholder: "Please enter password"
    }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "td_left"
    }, /*#__PURE__*/React.createElement("label", {
      for: "email"
    }, "EMAIL")), /*#__PURE__*/React.createElement("td", {
      class: "td_right"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "email",
      id: "email",
      placeholder: "Please enter email"
    }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "td_left"
    }, /*#__PURE__*/React.createElement("label", {
      for: "name"
    }, "NAME")), /*#__PURE__*/React.createElement("td", {
      class: "td_right"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "name",
      id: "name",
      placeholder: "Please enter real name"
    }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "td_left"
    }, /*#__PURE__*/React.createElement("label", {
      for: "phone"
    }, "PHONE")), /*#__PURE__*/React.createElement("td", {
      class: "td_right"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "phone",
      id: "phone",
      placeholder: "Please enter telephone number"
    }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "td_left"
    }, /*#__PURE__*/React.createElement("label", null, "GENDER")), /*#__PURE__*/React.createElement("td", {
      class: "td_right"
    }, /*#__PURE__*/React.createElement("select", {
      id: "gender",
      name: "gender"
    }, /*#__PURE__*/React.createElement("option", {
      value: "male"
    }, "Male"), /*#__PURE__*/React.createElement("option", {
      value: "female"
    }, "Female")))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      class: "td_left"
    })), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colspan: "2",
      align: "center"
    }, /*#__PURE__*/React.createElement("input", {
      type: "submit",
      id: "reg-sub",
      value: "register"
    })))));
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
    const data = await graphQLFetch(query, {
      user
    });

    if (data) {
      alert("Successfully registered!");
    }
  }

  render() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(UserAdd, {
      createUser: this.createUser
    }));
  }

}

const element = /*#__PURE__*/React.createElement(User, null);
ReactDOM.render(element, document.getElementById('register'));