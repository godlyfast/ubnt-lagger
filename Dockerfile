#Dockerfile

# Use this image as the platform to build the app
FROM node:20-alpine AS lagger

# Copy all local files into the image

WORKDIR /lagger

COPY . .

WORKDIR /lagger/app

RUN cd /lagger/script && rm -rf node_modules && yarn

# The WORKDIR instruction sets the working directory for everything that will happen next
WORKDIR /lagger/app

RUN cd /lagger/app && rm -rf node_modules .svelte-kit build && yarn

# Build SvelteKit app
RUN yarn build

# Delete source code files that were used to build the app that are no longer needed
RUN rm -rf src/ static/ emailTemplates

# The USER instruction sets the user name to use as the default user for the remainder of the current stage
# USER node:node

# This is the command that will be run inside the image when you tell Docker to start the container
# CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0"]
CMD [ "node", "build" ]