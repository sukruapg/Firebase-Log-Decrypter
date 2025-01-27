async function processFiles() {
    const logFile = document.getElementById('logFile').files[0];
    const privateKey = document.getElementById('privateKey').files[0];

    if (!logFile || !privateKey) {
        alert('Please select both log file and private key');
        return;
    }

    try {
        const privateKeyText = await privateKey.text();
        const logText = await logFile.text();
        const logLines = logText.split('\n');
        
        const logsContainer = document.getElementById('logsContainer');
        logsContainer.innerHTML = '';
        
        let isHeader = true;
        
        for (const line of logLines) {
            if (line.trim() === '') continue;
            
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            
            if (line.startsWith('#')) {
                if (isHeader) {
                    logEntry.innerHTML = `
                        <div class="header-line">${line}</div>
                    `;
                }
            } else {
                isHeader = false;
                const match = line.match(/(\d+)\s+\|\s+([^|]+)\|\s+(.+)/);
                
                if (match) {
                    const [_, index, timestamp, message] = match;
                    let decryptedMessage = message.trim();
                    
                    if (message.length > 100 && /^[A-Za-z0-9+/=]+$/.test(message.trim())) {
                        try {
                            decryptedMessage = await decryptMessage(message.trim(), privateKeyText);
                        } catch (error) {
                            decryptedMessage = `[Decryption failed]`;
                        }
                    }

                    logEntry.innerHTML = `
                        <div class="log-line">
                            <div class="log-index">${index}</div>
                            <div class="log-timestamp">${timestamp.trim()}</div>
                            <div class="log-message">
                                <div class="decrypted">${sanitizeOutput(decryptedMessage)}</div>
                                <div class="original" title="${sanitizeOutput(message.trim())}">
                                    ${sanitizeOutput(message.trim().substring(0, 20))}...
                                </div>
                                <div class="toggle-original" onclick="toggleOriginal(this)">Show full encrypted message</div>
                            </div>
                        </div>
                    `;
                }
            }
            logsContainer.appendChild(logEntry);
        }
    } catch (error) {
        alert('An error occurred while processing the files. Please try again.');
    }
}

function toggleOriginal(element) {
    const originalDiv = element.previousElementSibling;
    const fullMessage = originalDiv.getAttribute('title');
    
    if (originalDiv.style.whiteSpace === 'normal') {
        originalDiv.style.whiteSpace = 'nowrap';
        originalDiv.textContent = fullMessage.substring(0, 20) + '...';
        element.textContent = 'Show full encrypted message';
    } else {
        originalDiv.style.whiteSpace = 'normal';
        originalDiv.textContent = fullMessage;
        element.textContent = 'Show less';
    }
}

function sanitizeOutput(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function decryptMessage(encryptedBase64, privateKeyPEM) {
    try {
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPEM);
        const encryptedBytes = forge.util.decode64(encryptedBase64);

        let decrypted;
        try {
            decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
                md: forge.md.sha256.create(),
                mgf1: {
                    md: forge.md.sha256.create()
                }
            });
        } catch (e) {
            try {
                decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP');
            } catch (e2) {
                decrypted = privateKey.decrypt(encryptedBytes, 'RSAES-PKCS1-V1_5');
            }
        }

        try {
            const jsonDecrypted = JSON.parse(decrypted);
            return JSON.stringify(jsonDecrypted, null, 2);
        } catch (e) {
            return decrypted;
        }
    } catch (error) {
        throw error;
    }
} 