import { FastifyInstance } from 'fastify';
import { createReadStream } from 'node:fs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { openai } from '../lib/open-ai';
import fs from 'fs';

export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post('/videos/:videoId/transcription', async (request, reply) => {
    const paramsSchema = z.object({
      videoId: z.string().uuid(),
    });

    const { videoId } = paramsSchema.parse(request.params);

    const bodySchema = z.object({
      prompt: z.string(),
    });

    const { prompt } = bodySchema.parse(request.body);

    const video = await prisma.video.findUniqueOrThrow({
      where: { id: videoId },
    });

    const videoUrl = video.url;

    const audioReadStream = createReadStream(videoUrl);

    const { text: transcription } = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'json',
      temperature: 0,
      prompt,
    });

    await prisma.video.update({
      where: { id: videoId },
      data: {
        transcription: transcription,
      },
    });

    return transcription;
  });
}
