let thirdPartyDomains = [];

function checkThirdParty(requestDetails) {
    const url = new URL(requestDetails.url);
    const origin = new URL(requestDetails.originUrl || requestDetails.documentUrl);

    // Verificar se o domínio é diferente do domínio da página principal
    if (url.hostname !== origin.hostname) {
        if (!thirdPartyDomains.includes(url.hostname)) {
            thirdPartyDomains.push(url.hostname);
            // console.log(`Detected third-party domain: ${url.hostname}`);
        }
    }
}

browser.webRequest.onBeforeRequest.addListener(
    checkThirdParty,
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// Comunicação com o popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getThirdParties") {
        // console.log({thirdPartyDomains})
        sendResponse({thirdPartyDomains});
        return true;  // Adicione isto se estiver usando chamadas assíncronas
    }
});
