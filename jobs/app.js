import fastify from 'fastify'

const port = process.env.PORT || 5555;
const host = ("RENDER" in process.env) ? `0.0.0.0` : `localhost`;

const server = fastify({
  logger: true
})

server.get('/', function (request, reply) {
  reply.type("application/json").send({ hello: 'world' })
})

server.listen({ host: host, port: port }, function (err, address) {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
})