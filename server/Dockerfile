FROM node:10
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENV DB_URL="mongodb://54.237.77.73:27017"
CMD [ "npm", "start" ]