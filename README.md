# Git Visualization

Visualizing git activity starts with collecting git events. There are many ways to do this, ranging from polling APIs to setting up an additional remote on each developer's workstation to using Github webhooks. Webhooks are the simplest to implement, so we'll start here. Their main limitation is that they only work when we have administrative access to the Github organization or repository.

## Run Local Webhook Consumer

To setup a local webhook consumer, first clone the repository and run the server:

```bash
$ git clone git@github.com:thehackerati/gitviz.git 
$ cd gitviz
$ npm install
$ X_HUB_SECRET=yoursecretkey node app.js
$ open http://localhost:3000
```

X_HUB_SECRET is a shared secret that you will also configure when you setup the Github Webhook.

Because Github webhooks originate outside of your local network, you will probably need to expose this service to the public internet over a secure tunnel. The simplest way to do this on OS X is to use ngrok:

```bash
$ brew cask install ngrok
$ ngrok http 3000
```

You'll see a screen that looks like this:

```bash
ngrok by @inconshreveable                                 (Ctrl+C to quit)

Tunnel Status                 online
Version                       2.0.25/2.0.25
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    http://8530525b.ngrok.io -> localhost:3000
Forwarding                    https://8530525b.ngrok.io -> localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

## Configure the Github Webhook

Github allows you to configure webhooks at the Organization and Repository level. In either case, you will need to provide the following information to send events to your local development environment:

```
Payload URL: http://8530525b.ngrok.io/hook  // Match ngrok forwarding
Content Type: application/json
Secret: yoursecretkey  // Match your X_HUB_SECRET environment variable
```

Note that your Payload URL will change each time that you restart ngrok.

You can also choose which events you want Github to send. We'll need to figure out what we need to create an engaging visualization, so for now, just send everything.

## TODO
- dockerize
- deploy
- figure out data pipeline - log file->DB or direct DB insert?`

## License
Copyright (c) 2016 Hackerati. This software is licensed under the MIT License.