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
        fetch(baseUrl + "accounts", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
          }).then(res => res.json())
          .then(response => {
              loading.innerText = "";
              
              const accounts = response.data.data;
              let htmlString = "";

              for(let i = 0; i < accounts.length; i++){
                  const userBox = `
                    <div class="userBox">
                        <span id=${accounts[i]._id} class="account_name">
                            ${accounts[i].name}
                        </span id=${accounts[i]._id}>
                        <span id=${accounts[i]._id} class="asterisk">
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
                            const account = accounts[i];

                            await fetch(baseUrl + `accounts/${account._id}`, {
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

              const account_names = document.getElementsByClassName("account_name");
              for(let i = 0; i < account_names.length; i++){
                  const account_name = account_names[i];

                  account_name.addEventListener("click", async (e) => {
                        try{
                            loading.innerText = "Loading. Please wait...";
                            const account = accounts[i];

                            const share = document.getElementById("share");

                            if(!share.value){
                                return alert("Please enter username");
                            }
                            
                            const option = prompt("What do you want to do...share or selete?");

                            if(!option || (option !== 'delete' && option !== 'share')){
                              return alert("Please specify the action you wish to perform. share or delete.");
                            }

                            let res = await fetch(baseUrl + `users/${share.value}`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  "Authorization": `Bearer ${token}`,
                                },
                                body: JSON.stringify({accountId: account._id, option})
                            });

                            loading.textContent = "";
                            share.value = "";

                            if(res.status == 200){
                                return alert(`Operation Successful!`);
                            }else{
                                return alert("An error occured or user does not exist!!");
                            }
                        }catch(error){
                            alert("An error occured or user does not exist!");
                            share.value = "";
                            errorDiv.textContent = error.response.data.message;
                            loading.textContent = "";
                        
                            setTimeout(() => {
                              error.textContent = "";
                            }, 5000); 
                        }
                  });
              }
        }).catch(error => {
            alert("An error occured!");
            errorDiv.textContent = error.response.data.message;
            loading.textContent = "";
        
            setTimeout(() => {
              error.textContent = "";
            }, 5000);
        })
    }
  });