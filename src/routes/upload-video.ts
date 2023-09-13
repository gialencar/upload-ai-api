import { FastifyInstance } from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';
import fs from 'node:fs';
import { prisma } from '../lib/prisma';

const pump = promisify(pipeline);

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, // 25 MB
    },
  });

  app.post('/videos', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({
        error: 'No file uploaded',
      });
    }

    const fileExtension = path.extname(data.filename);
    if (fileExtension !== '.mp3') {
      return reply.status(400).send({
        error: 'Invalid file type, please upload an MP3 file',
      });
    }

    const fileBaseName = path.basename(data.filename, fileExtension);
    const fileUploadName = `${fileBaseName}-${randomUUID()}${fileExtension}`;

    const uploadDestination = path.join(path.resolve(__dirname), '../../tmp', fileUploadName);

    await pump(data.file, fs.createWriteStream(uploadDestination));

    const video = await prisma.video.create({
      data: {
        title: fileBaseName,
        url: uploadDestination,
      },
    });

    return reply.status(200).send({ video });
  });
}
