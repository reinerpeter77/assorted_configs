
```
# from copilot 2025
# Run the following command to create a private key:
openssl genrsa -out mykey.key 2048
# Create a Certificate Signing Request (CSR)
openssl req -new -key mykey.key -out mycsr.csr
# Generate the Self-Signed Certificate
openssl x509 -req -days 365 -in mycsr.csr -signkey mykey.key -out mycert.crt
# To check the details of your certificate:
openssl x509 -text -noout -in mycert.crt


# Modify your webpack.config.js to specify the IP address  ?? maybe not necessary:
const fs = require('fs');

module.exports = {
  devServer: {
    host: '22.222.222.222', // Replace with your actual IP
    https: {
      key: fs.readFileSync('./mycert.key'),
      cert: fs.readFileSync('./mycert.crt'),
    },
  },
};


```
