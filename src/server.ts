import fastify from 'fastify';

const app = fastify({ logger: true });

app.get('/', () => {
  return { hello: 'world' };
});

app.listen({ port: 3333 });
