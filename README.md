This plugin allows AKP48Squared to connect to Skype.

# Installation

This plugin is included by default on new installations of AKP48Squared. You are required to have a properly signed (not self-signed) SSL certificate in order for Skype functionality to work. You will also need to ensure that the server you run AKP48Squared on is accessible from the internet. Setting up Skype for AKP48Squared is not for the faint-of-heart. If you have any trouble, drop by #AKP on EsperNet and we might be able to help.

# Config

You'll need to add a new server to your configuration file for each Skype bot you'd like to run. An example is shown below.

```
"servers": [
  {
    "plugin": "skype",
    "config": {
      "appId": "ee4ac8ab-678f-4c88-b421-64ab2d1cff54", // appId and secret come from Skype Dev Center. See https://www.skype.com/en/developer/ for more info.
      "appSecret": "DSi7WTPXO3AS6FFic2S1saZ",
      "certLoc": "cert.crt", // You will need to have a properly signed certificate and key for Skype functionality to work.
      "keyLoc": "secret.key"
    }
  }
]
```

# Issues

If you come across any issues, you can report them on this GitHub repo [here](https://github.com/AKP48Squared/skype-server/issues).
