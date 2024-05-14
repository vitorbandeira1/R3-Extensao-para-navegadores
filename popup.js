document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tablinks');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(event) {
            let tabName = tab.textContent.trim().replace(/\s+/g, "").replace(" ", ""); // Ajuste para remover espaços corretamente
            let elementId = "";
            if (tabName === "ThirdPartyDomains") {
                elementId = "ThirdPartyDomains";
            } else if (tabName === "LocalStorage") {
                elementId = "LocalStorageUsage";
            } else if (tabName === "CanvasFingerprint") {
                elementId = "CanvasFingerprint";
            } else if (tabName === "Cookies") {
                elementId = "Cookies";
            }

            openTab(event, elementId); // Passa elementId diretamente
            if (elementId === "ThirdPartyDomains") {
                updateThirdPartyDomains();
            }
            if (elementId === "LocalStorageUsage") {
                updateLocalStorageUsage();
            }
            if (elementId === "CanvasFingerprint") {
                updateCanvasFingerprint();
            }
            if (elementId === "Cookies") {
                updateCookiesData();
            }
        });
    });
    if (tabs.length > 0) {
        tabs[0].click(); // Abre a primeira aba por padrão
    }
});
function openTab(evt, elementId) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    if (elementId) {
        document.getElementById(elementId).style.display = "block";
        evt.currentTarget.className += " active";
    }
}

function updateLocalStorageUsage() {
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
        browser.tabs.sendMessage(tabs[0].id, {message: "getStorageData"}).then(response => {
            document.getElementById('localStorageData').textContent = JSON.stringify(response.localStorage, null, 2);
            document.getElementById('sessionStorageData').textContent = JSON.stringify(response.sessionStorage, null, 2);
        }).catch(err => console.error("Error fetching storage data: ", err));
    });
}

function updateThirdPartyDomains() {
    browser.runtime.sendMessage({type: "getThirdParties"}).then(response => {
        const domainsList = document.getElementById('domainList');
        domainsList.innerHTML = '';  // Limpa lista existente

        // console.log("Alcanca ate aqui")
        response.thirdPartyDomains.forEach(domain => {
            let listItem = document.createElement('li');
            listItem.textContent = domain;
            domainsList.appendChild(listItem);
        });
    }).catch(err => console.error("Error fetching third party domains: ", err));
}

function updateCanvasFingerprint() {
    // Solicita os dados de tentativas de fingerprinting de canvas ao content script
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
        browser.tabs.sendMessage(tabs[0].id, {message: "getCanvasData"}).then(attempts => {
            const attemptsList = document.getElementById('fingerprintList');
            attemptsList.innerHTML = ''; // Limpa lista existente
            if (attempts.length > 0) {
                attempts.forEach(attempt => {
                    let listItem = document.createElement('li');
                    listItem.textContent = attempt;
                    attemptsList.appendChild(listItem);
                });
            } else {
                let listItem = document.createElement('li');
                listItem.textContent = "No canvas fingerprinting attempts detected.";
                attemptsList.appendChild(listItem);
            }
        }).catch(err => console.error("Error fetching canvas fingerprint data: ", err));
    });
}

function updateCookiesData() {
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
        browser.tabs.sendMessage(tabs[0].id, {message: "getCookiesData"}).then(cookies => {
            const firstPartyList = document.getElementById('firstPartyCookiesList');
            const thirdPartyList = document.getElementById('thirdPartyCookiesList');
            firstPartyList.innerHTML = '';  // Limpa lista existente
            thirdPartyList.innerHTML = '';  // Limpa lista existente

            cookies.firstPartyCookies.forEach(cookie => {
                let listItem = document.createElement('li');
                listItem.textContent = `${cookie.name}: ${cookie.value}`;
                firstPartyList.appendChild(listItem);
            });

            cookies.thirdPartyCookies.forEach(cookie => {
                let listItem = document.createElement('li');
                listItem.textContent = `${cookie.name}: ${cookie.value}`;
                thirdPartyList.appendChild(listItem);
            });
        }).catch(err => console.error("Error fetching cookies data: ", err));
    });
}