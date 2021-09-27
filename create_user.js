const baseUrl = "https://share-accounts-api.herokuapp.com/";

chrome.storage.sync.get(["loggedInUser"], function (result) {
  const loggedInUser = JSON.parse(result.loggedInUser);

  token = loggedInUser.token;
  user = loggedInUser.data.user;

  if (token && user && user.role === 'admin') {

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    
    const loading = document.getElementById("loading");
    const errorDiv = document.getElementById("error");
    
    const registerBtn = document.getElementById("registerBtn");
    registerBtn.addEventListener("click", async (e) => {
      e.preventDefault();
    
      const username = usernameInput.value;
      const password = passwordInput.value;
    
      try {
        if (username && password) loading.textContent = "Please wait...";
        let res = await fetch(baseUrl + "users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
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

        if (res.status === "error") {
            errorDiv.textContent = res.message;
      
            setTimeout(() => {
              error.textContent = "";
            }, 5000);
          }
        
        usernameInput.value = "";
        passwordInput.value = "";
    } catch (error) {
        usernameInput.value = "";
        passwordInput.value = "";

        errorDiv.textContent = error.response.data.message;
        loading.textContent = "";
    
        setTimeout(() => {
          error.textContent = "";
        }, 5000);
      }
    });
  }
});
