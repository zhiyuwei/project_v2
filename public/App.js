const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

function open_win() 
        {
            window.location="register.html"
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

async function login() {
  var un = document.getElementById("username").value;
  var pw = document.getElementById("password").value;
  
  
  const user = {
    username: un,
    password: pw
  };
  const query = `mutation userLogin($user: UserLogin!)  {
                userLogin(user: $user){
                username password person
            }
        }`;

  const data = await graphQLFetch(query, {
    user
  });

  if(un=="" || pw==""){
    document.getElementById("contain").innerHTML="<p>Please fill in the blanks<p>"
  }
  else if (data.userLogin==null) {
    document.getElementById("contain").innerHTML="<p>The user name or password is incorrect. Please try again later.<p>"
  }

  else if(data.userLogin.person=="student"){
    window.location="homepage.html"
  }

  else{
    window.location="staff.html"
    window.event.returnValue=false;
  }
  

}

