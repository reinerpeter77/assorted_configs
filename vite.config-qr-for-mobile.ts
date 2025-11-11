

// This version starts up vite server and displays qr code for viewing on phone.
// Computer should be tethered to phone hotspot so local subnet.
// From google gemini. 
// Need https for web api sensors to work: location, orientation etc. 
// Note: webpack dev server does this but vite needs a plugin as shown here

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// npm install -D @vitejs/plugin-basic-ssl
import basicSsl from '@vitejs/plugin-basic-ssl'; // New plugin for basic SSL
import os from 'os';
import qrcode from 'qrcode';

// 💡 IMPORTANT: Replace 'YOUR_LOCAL_IP_ADDRESS' with your actual IP
// (e.g., '192.168.1.5'). The getLocalIP function below attempts to find it.
const LOCAL_IP = getLocalIP();
const URLstr = `https://${LOCAL_IP}:5173/`

export default defineConfig({
    plugins: [
        basicSsl(), // This generates a self-signed certificate and key
        react(),
        doQR(URLstr), 
    ],
    server: {
        https: true, // Enable HTTPS
        host: true, // if not here, phone will not connect
        open: URLstr,
    },
});


function getLocalIP() {
    const interfaces = os.networkInterfaces(); 
    let retAddr:string = 'not found';
    for (const name in interfaces) {
        // console.log('name: ' + name)
        for (const iface of interfaces[name]!) {
            // console.log('found: ' + iface.family + '  ' + iface.internal + '  ' + iface.address)
            if ((name.indexOf('Wi-Fi') != -1) // use only this interface
                 && iface.family === 'IPv4' // this gives the IP addr
                 && !iface.internal) {
                console.log('found network: '+ iface.family + '  ' + iface.internal + '  ' + iface.address)
                retAddr = iface.address
            }
        }
    }
    return retAddr
}

/**
 * Custom Vite Plugin Factory to print a monochrome QR code to the terminal.
 * * @param {string} content The URL or text to encode in the QR code.
 * @returns {import('vite').Plugin} The Vite plugin object.
 */
function doQR(content: string) {
    const ANSI_RESET = '\x1b[0m';
    const ANSI_BG_BLACK = '\x1b[40m'; // Background Black
    const ANSI_BG_WHITE = '\x1b[47m'; // Background White
    const ANSI_FG_WHITE = '\x1b[37m'; // Foreground White (for separator)
    const ANSI_FG_YELLOW = '\x1b[33m'; // Foreground Yellow (for content text)
    return {
        name: 'custom-monochrome-qrcode-printer',
        configureServer(server) {
            server.httpServer.once('listening', async () => {
                const qrCodeString = await qrcode.toString(content, {
                    type: 'terminal',
                    small: true,
                    errorCorrectionLevel: 'H',
                    color: {
                        // Dark modules (squares) are white background, Light modules are black background
                        dark: ANSI_BG_WHITE + '  ',
                        light: ANSI_BG_BLACK + '  ',
                    }
                });

                // Add a small delay and print the result
                setTimeout(() => {
                    console.log(ANSI_FG_WHITE + content + ' ↓↓↓↓↓\n' + qrCodeString + ANSI_RESET );
                    }, 100);
            });
        },
    };
}
