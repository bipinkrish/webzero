FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json .npmrc ./

RUN npm install

COPY . .

RUN mkdir -p /usr/src/app/.next && \
    chmod -R 777 /usr/src/app && \
    mkdir -p /usr/src/app/src/components/generated && \
    chmod -R 777 /usr/src/app/src/components/generated

RUN adduser -D appuser && \
    chown -R appuser:appuser /usr/src/app
USER appuser

EXPOSE 7860

ENV NODE_ENV=development

CMD ["sh", "-c", "npm run dev -- -p 7860"]
