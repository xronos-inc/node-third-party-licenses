# SPDX-FileCopyrightText: (c) 2024 Xronos Inc.
# SPDX-License-Identifier: BSD-3-Clause

FROM node

WORKDIR /app

# copy npm package dependencies
COPY package.json /app
COPY package-lock.json /app

# build your npm project
RUN npm run build --production

# collect licenses for the production build
RUN npm install license-checker
RUN npx license-checker --production --json > licenses.json

# generate third-party license statement
COPY third-party-licenses.js /app
COPY THIRD_PARTY_LICENSES.md.in /app
# COPY third-party-licenses/* /app/third-party-licenses
RUN node third-party-licenses.js licenses.json --include THIRD_PARTY_LICENSES.md.in

# copy the license for this repository into the image
COPY LICENSE /app

# serve the app/ directory to view generated files
EXPOSE 3000
ENTRYPOINT ["npm", "run", "serve"]
