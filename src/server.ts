import fastify from 'fastify';
import { getAllPromptsRoute } from './routes/get-all-prompts';
import { uploadVideoRoute } from './routes/upload-video';

const PORT = Number(process.env.PORT) || 3333;
const app = fastify({ logger: true });

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);

app.listen({ port: PORT });
