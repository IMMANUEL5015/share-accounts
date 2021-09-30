const baseUrl = "https://share-accounts-api.herokuapp.com/";

chrome.storage.local.get(["loggedInUser"], function (result) {
  const loggedInUser = JSON.parse(result.loggedInUser);

  token = loggedInUser.token;
  user = loggedInUser.data.user;

  if (token && user && user.role === 'admin') {

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const adminInput = document.getElementById("admin");
    
    const loading = document.getElementById("loading");
    const errorDiv = document.getElementById("error");
    
    const registerBtn = document.getElementById("registerBtn");
    registerBtn.addEventListener("click", async (e) => {
      e.preventDefault();
    
      const username = usernameInput.value;
      const password = passwordInput.value;
      const adminCode = adminInput.value;
    
      try {
        if (username && password) loading.textContent = "Please wait...";
        
        let res;
        
        if(username && password && !adminCode){
          res = await fetch(baseUrl + "users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ username, password }),
          });
        }
        
        if(username && password && adminCode){
          res = await fetch(baseUrl + "users/admin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ username, password, adminCode }),
          });
        } 
    
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
        adminInput.value = "";
    } catch (error) {
        usernameInput.value = "";
        passwordInput.value = "";
        adminInput.value = "";

        errorDiv.textContent = error.response.data.message;
        loading.textContent = "";
    
        setTimeout(() => {
          error.textContent = "";
        }, 5000);
      }
    });
  }
});
