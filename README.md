# Aloware Talk 2.0 (aloware-talk2)

Aloware Agent Interface

## Install the dependencies
```bash
npm install
```

### Start the web app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Start the electron app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev -m electron
```

### Lint the files
```bash
npm run lint
```

### Build the web app for production
```bash
quasar build
```

### Build the iOS app for production
```bash
quasar build -m ios --ide
```

### Build the iOS app for production
```bash
quasar build -m android --ide
```

### Build the macOS app
```bash
npm run build-mac
```

### Deploy the macOS app
```bash
npm run deploy-mac
```

### Build the windows app
```bash
npm run build-win
```

### Deploy the windows app
1. Install Docker on macOS
2. Run docker:
```bash
docker run --rm -ti \
 --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_') \
 --env ELECTRON_CACHE="/root/.cache/electron" \
 --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
 -v ${PWD}:/project \
 -v ${PWD##*/}-node-modules:/project/node_modules \
 -v ~/.cache/electron:/root/.cache/electron \
 -v ~/.cache/electron-builder:/root/.cache/electron-builder \
 electronuserland/builder:wine
```
3. Install dependencies on docker machine:
```bash
npm install -g @quasar/cli
```
4. Deploy the windows app:
```bash
quasar build -m electron -T win -b builder -P always
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).
