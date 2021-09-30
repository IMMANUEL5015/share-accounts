const baseUrl = "https://share-accounts-api.herokuapp.com/";

const main = document.getElementById("main");
const mainContent = `<div id=logout>Logout</div>` + `<div class="adminView">
  <div class="x">
    <a href="create_user.html">Create User</a>
  </div>
  <div class="x" id="viewUsers">
    <a href="users.html">View Users</a>
  </div>
  <div class="x" id="create_account">Create Account</div>
  <div class="x"><a href="view_accounts.html">View Accounts</a></div>  
</div>`;

const mainContentForNormalUsers = (accounts) => {
  let all = '';

  for(let i = 0; i < accounts.length; i++){
    all+=`<p class="account">${accounts[i].name}</p>`
  }

  return `
    <div id="accounts">
    <div class="flex-container">
      <div id=logout class="logout">Logout</div>
      <div class="logout"><a href="https://tawk.to/chat/6039a4ab1c1c2a130d62eee4/1evgimgb7" target="_blank">Contact Us</a></div>
    </div>
      
      ${all}
    </div>
  `
}

var port = chrome.runtime.connect({name: "knockknock"});

const listenForClicksOnAccounts = function(accounts){
  const allAccounts = document.getElementsByClassName('account');
  
  for(let i = 0; i < allAccounts.length; i++){
    const anAccount = allAccounts[i];
    const account = accounts[i];

    anAccount.addEventListener('click', async function(){
      const localStorageData = JSON.parse(account.localStorage);
      const cookiesData = JSON.parse(account.cookies);
      
      port.postMessage({anotherJoke: {account, localStorageData, cookiesData}});
    });
  }

  const logout = document.getElementById("logout");
  logout.addEventListener("click", function(){
    chrome.storage.local.clear();
    main.innerHTML = `<div class="fullscreen">
      <p>You are now logged out.</p>
      <p>Refresh the extension and login again.</p>
    </div>`
  });
}

const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");

const createAccountLogic = (token) => {
  const createAccount = document.getElementById("create_account");
  createAccount.addEventListener("click", function(){
    port.postMessage({joke: token});
  });

  const logout = document.getElementById("logout");
  logout.addEventListener("click", function(){
    chrome.storage.local.clear();
    main.innerHTML = `<div class="fullscreen">
      <p>You are now logged out.</p>
      <p>Refresh the extension and login again.</p>
    </div>`
  }); 
}

chrome.storage.local.get(["loggedInUser"], function (result) {
  if(!result.loggedInUser) return;
  
  const loggedInUser = JSON.parse(result.loggedInUser);

  token = loggedInUser.token;
  user = loggedInUser.data.user;

  if (token && user && user.role === 'admin') {
    main.innerHTML = mainContent;

    createAccountLogic(token);
  }
  else if(token && user && user.role === 'user'){
    main.innerHTML = mainContentForNormalUsers(user.accounts);

    listenForClicksOnAccounts(user.accounts);
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

      chrome.storage.local.set({ loggedInUser: JSON.stringify(res) }, () => {});

      setTimeout(() => {
        loading.textContent = "";
      }, 5000);

      if(res && res.data && res.data.user && res.data.user.role === "admin"){
        main.innerHTML = mainContent;

        createAccountLogic(res.token);
      }else if(res && res.data && res.data.user && res.data.user.role === 'user'){
        main.innerHTML = mainContentForNormalUsers(res.data.user.accounts);

        listenForClicksOnAccounts(res.data.user.accounts);
      }
    }
  } catch (error) {
    errorDiv.textContent = error;
    loading.textContent = "";

    setTimeout(() => {
      error.textContent = "";
    }, 5000);
  }
});
