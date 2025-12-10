# ASR Alpha UI

This is a skeleton for a new MUI app using the next.js app router.
It is based on this example: https://github.com/mui/material-ui/tree/master/examples/material-ui-nextjs-ts

It is intended to be used as the base for the new ASR Alpha UI, and also to be forked to
be used as a new contractor UI boilerplate.

It consists of the following basic features:

- Next.js 14 with App router
- Auth0 integration with nextjs-auth0
- MUI 5
- next-intl
- Basic API clients for user-service-api and templateless-api-v2

# Setup

- Make sure you have credentials set up for logging in to the GCP registry
- `yarn registry-login`
- `yarn install`

To run, you need to set up config via `.env.local`. Go on VPN and use the script `get-config.sh`:

- `NETSMILE_CONFIGURATION_SERVICE=https://configuration-service.aiscanrobo.dev.netsmile.jp ./get-config.sh`

If you want to run against your dev VM, instead use this command:

- `NETSMILE_CONFIGURATION_SERVICE=http://192.168.1.XXX:8887 ./get-config.sh` (where XXX should be replaced with the IP of your VM)

This will create a `.env.local` file where you run just the UI locally, with both templateless-api-v2
and user-service-api running remotely.

If you want to run the UI against locally running APIs, you have to edit `.env.local` first. There are
instructions in the file.

## TODO

As of 2024.08.15

- Add Jest support
- Upgrade to latest ESLint (to be done as a separate task, see ASR-844)
- Test and tweak Dockerfile
