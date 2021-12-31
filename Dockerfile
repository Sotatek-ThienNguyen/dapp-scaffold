FROM node:14

ENV PORT=4001

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

RUN npm run build

EXPOSE $REACT_APP_PORT

CMD ["node", "server"]
