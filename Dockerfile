FROM node:17-bullseye-slim as base

ADD . .
RUN yarn
RUN yarn run build

EXPOSE 3000

CMD ["yarn", "start"]