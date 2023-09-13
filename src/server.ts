import fastify from 'fastify';
import { getAllPromptsRoute } from './routes/get-all-prompts';

const PORT = Number(process.env.PORT) || 3333;
const app = fastify({ logger: true });

app.register(getAllPromptsRoute);

app.listen({ port: PORT });
