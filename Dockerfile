#Dockerfile

# Use this image as the platform to build the app
FROM node:20-alpine AS shms-build

# Copy all local files into the image

COPY . /shms

WORKDIR /shms/app

RUN cd /shms/pf-router && \
rm -rf node_modules && \
yarn install --prod && \
rm -rf artifacts && \
cd /shms/app && \
rm -rf node_modules .svelte-kit build && \
yarn install && \
yarn build && \
rm -rf node_modules && \
yarn install --prod && \
rm -rf src/ static/ .svelte-kit prisma 

# The USER instruction sets the user name to use as the default user for the remainder of the current stage
# USER node:node

FROM node:20-alpine AS shms
COPY --from=shms-build /shms /shms

WORKDIR /shms/app

CMD [ "node", "build" ]