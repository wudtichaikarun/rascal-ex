import 'dotenv/config'

export const config = {
  amqp: {
    AMQP_URI: process.env.AMQP_URI,
    AMQP_USERNAME: process.env.AMQP_USERNAME,
    AMQP_PASSWORD: process.env.AMQP_PASSWORD,
  },
}
