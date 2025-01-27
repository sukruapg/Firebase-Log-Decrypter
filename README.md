# Firebase Log Decrypter

A simple web tool to decrypt Firebase crash logs using RSA private key.

## Usage

1. Open `index.html` in a web browser
2. Select your `.log` file
3. Select your private key (`.pem`) file
4. Click "Process Logs" to decrypt the logs

## Features

- Decrypts Firebase encrypted logs
- Supports multiple RSA decryption schemes
- Shows both encrypted and decrypted messages
- Clean and simple interface
- No server required - runs entirely in browser

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase log file
- Corresponding RSA private key in PEM format
