const baseUrl = "https://share-accounts-api.herokuapp.com/";

const main = document.getElementById("main");
const mainContent = `<div class="adminView">
  <div class="x">
    <a href="create_user.html">Create User</a>
  </div>
  <div class="x" id="viewUsers">
    <a href="users.html">View Users</a>
  </div>
  <div class="x" id="create_account">Create Account</div>
  <div class="x"><a href="view_accounts.html">View Accounts</a></div>  
</div>`;

var port = chrome.runtime.connect({name: "knockknock"});

const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");

const createAccountLogic = (token) => {
  const createAccount = document.getElementById("create_account");
  createAccount.addEventListener("click", function(){
    port.postMessage({joke: token});
  });
}

chrome.storage.sync.get(["loggedInUser"], function (result) {
  const loggedInUser = JSON.parse(result.loggedInUser);

  token = loggedInUser.token;
  user = loggedInUser.data.user;

  if (token && user && user.role === 'admin') {
    main.innerHTML = mainContent;

    createAccountLogic(token);
  }
});

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const username = usernameInput.value;
  const password = passwordInput.value;

  try {
    if (username && password) loading.textContent = "Please wait...";
    let res = await fetch(baseUrl + "auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    res = await res.json();

    loading.textContent = "";

    if (res.status === "fail") {
      errorDiv.textContent = res.message;

      setTimeout(() => {
        error.textContent = "";
      }, 5000);
    }

    if (res.status === "success") {
      loading.textContent = "Login successful!";

      chrome.storage.sync.set({ loggedInUser: JSON.stringify(res) }, () => {});

      setTimeout(() => {
        loading.textContent = "";
      }, 5000);

      if(res && res.data && res.data.user && res.data.user.role === "admin"){
        main.innerHTML = mainContent;

        createAccountLogic();
      }
    }
  } catch (error) {
    errorDiv.textContent = error.response.data.message;
    loading.textContent = "";

    setTimeout(() => {
      error.textContent = "";
    }, 5000);
  }
});
