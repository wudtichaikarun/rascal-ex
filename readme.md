# Rascal example

- [install and start RabbitMQ server](https://www.rabbitmq.com/install-homebrew.html)
- start project

## install and RabbitMQ server

Install

- `brew update`
- `brew install rabbitmq`

start

- `brew services start rabbitmq`
- http://localhost:15672/#/
  - username: guest
  - password: guest

stop

- `brew services stop rabbitmq`

## start project

1. add file .env

.env value

```
AMQP_URI=amqp://0.0.0.0:5672
AMQP_USERNAME=guest
AMQP_PASSWORD=guest
```

folders structure

```
├── .env
├── package-lock.json
├── package.json
├── readme.md
├── src
└── tslint.json

```

2. install dependencies `npm install`
3. start project `npm run dev`
