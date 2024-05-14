// content.js
console.log("TEST")
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Storage exec")
    if (request.message === "getStorageData") {
        const localStorageData = {...localStorage};
        const sessionStorageData = {...sessionStorage};
        sendResponse({localStorage: localStorageData, sessionStorage: sessionStorageData});
    }
});


// Mensagem de teste para confirmar que o script está carregando
console.log("TEST - content.js loaded");

// Armazena tentativas de fingerprinting para enviar ao popup
var canvasFingerprintAttempts = [];

// Função para interceptar e registrar métodos específicos do contexto do canvas
function interceptCanvasMethods() {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        console.log("Attempting to get Canvas context of type:", type);
        const context = originalGetContext.apply(this, [type, ...args]);

        if (type === '2d') {
            console.log("2D context acquired, applying intercepts...");

            // Intercept fillText
            const originalFillText = context.fillText;
            context.fillText = function(text, x, y, maxWidth) {
                canvasFingerprintAttempts.push("Canvas fingerprinting attempt detected: fillText");
                console.log("fillText intercepted:", text);
                return originalFillText.apply(this, arguments);
            };

            // Intercept getImageData
            const originalGetImageData = context.getImageData;
            context.getImageData = function(sx, sy, sw, sh) {
                canvasFingerprintAttempts.push("Canvas fingerprinting attempt detected: getImageData");
                console.log("getImageData intercepted");
                return originalGetImageData.apply(this, arguments);
            };
        }

        return context;
    };
}

// Listener para responder a solicitações de dados do popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "getStorageData") {
        console.log("Handling storage data request");
        const localStorageData = {...localStorage};
        const sessionStorageData = {...sessionStorage};
        sendResponse({localStorage: localStorageData, sessionStorage: sessionStorageData});
    } else if (request.message === "getCanvasData") {
        console.log("Sending canvas fingerprinting data to popup:", canvasFingerprintAttempts);
        sendResponse(canvasFingerprintAttempts);
        canvasFingerprintAttempts = []; // Limpa a lista após enviar
    }
});

// Aplica as interceptações depois que o DOM estiver totalmente carregado
document.addEventListener('DOMContentLoaded', interceptCanvasMethods);

function getCookiesData() {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const firstPartyCookies = [];
    const thirdPartyCookies = [];

    cookies.forEach(cookie => {
        const parts = cookie.split('=');
        const name = parts.shift().trim();
        const value = parts.join('=');
        const domain = location.hostname;

        // Assumindo que cookies de terceiros são definidos por domínios diferentes do principal
        if (document.domain === domain) {
            firstPartyCookies.push({name, value});
        } else {
            thirdPartyCookies.push({name, value});
        }
    });

    return {firstPartyCookies, thirdPartyCookies};
}

// Listener para responder a solicitações de dados de cookies do popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "getCookiesData") {
        sendResponse(getCookiesData());
    }
});