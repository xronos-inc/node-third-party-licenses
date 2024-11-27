# Node Third-Party License Notices

Use this script to automatically generate a `THIRD_PARTY_LICENSES.md` with references to
all npm packages used by your application. The third-party license files that are
installed by npm are copied into a `third-party-license/` folder for inclusion with your
distribution.

## Requirements

- node.js
- npm
- npx

## Usage

### Generate Third-Party License Notice

Open a terminal and change into the root directory of your node project. Install your
project dependencies.

```shell
npm install
```

Generate the list of node dependencies using `license-checker`:

```shell
npm install license-checker
npx license-checker --production --json > licenses.json
```

Copy `third-party-licenses.js` to the root directory of your node project run:

```shell
node third-party-licenses.js licenses.json
```

The file `THIRD_PARTY_NOTICE.md` will be generated along with its referenced license
files in `third-party-licenses/`.

An optional `--include <include.md>` flag allows inclusion of an additional markdown file
at the end of the third-party notice. Use this to add additional third-party statements
to the notice.

### Test

```shell
npm install
npm run serve
```

## Docker

Node packages are often used in docker images. These images typically should include
third-party license statements. An example of how to build such an image is included
here.

```shell
docker build . --tag third-party-license
docker run -p 3000:3000 third-party-license
```

If you have third-party license files you wish to add to the image, copy them into the
`/app/third-party-licenses` folder of the image:

```dockerfile
COPY third-party-licenses/* /app/third-party-licenses
```
