const baseUrl = "https://softkeyshare.herokuapp.com/";

const main = document.getElementById("main");

const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");

chrome.storage.local.get(["loggedInUser"], function (result) {
    const loggedInUser = JSON.parse(result.loggedInUser);
  
    token = loggedInUser.token;
    user = loggedInUser.data.user;

    if (token && user && user.role === 'admin') {
        loading.innerText = "Loading. Please wait...";
        fetch(baseUrl + "users", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
          }).then(res => res.json())
          .then(response => {
              loading.innerText = "";
              
              const users = response.data.data;
              let htmlString = "";

              for(let i = 0; i < users.length; i++){
                  const userBox = `
                    <div class="userBox">
                        <span id=${users[i]._id}>${users[i].username}</span id=${users[i]._id}>
                        <span id=${users[i]._id} class="asterisk">
                            *
                        </span>
                    </div>
                  `;
                  htmlString+=userBox;
              }

              main.innerHTML = htmlString;

              const asterisks = document.getElementsByClassName("asterisk");
              const userBoxEls = document.getElementsByClassName("userBox");
              for(let i = 0; i < asterisks.length; i++){
                  const asterisk = asterisks[i];

                  asterisk.addEventListener("click", async (e) => {
                        try{
                            loading.innerText = "Loading. Please wait...";
                            const user = users[i];
                            
                            if(user.role === 'admin'){
                                errorDiv.textContent = "You can't delete an admin user!";
                                loading.textContent = "";
                            
                                setTimeout(() => {
                                  error.textContent = "";
                                }, 5000);   

                                return;
                            }

                            await fetch(baseUrl + `users/${user._id}`, {
                                method: "DELETE",
                                headers: {
                                  "Content-Type": "application/json",
                                  "Authorization": `Bearer ${token}`
                                },
                              });

                            loading.textContent = "";
                            userBoxEls[i].style.display = "none";
                        }catch(error){
                            errorDiv.textContent = error.response.data.message;
                            loading.textContent = "";
                        
                            setTimeout(() => {
                              error.textContent = "";
                            }, 5000); 
                        }
                  });
              }
        }).catch(error => {
            errorDiv.textContent = error.response.data.message;
            loading.textContent = "";
        
            setTimeout(() => {
              error.textContent = "";
            }, 5000);
        })
    }
  });