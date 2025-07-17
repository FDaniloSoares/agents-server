import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import { db } from '../../db/conection.ts';
import { schema } from '../../db/schema/index.ts';
import { generateEmbedding, transcribeAudio } from '../../services/gimini.ts';

export const uploadAudioRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/audio',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;
      const audio = await request.file();

      // node trabalha com stream

      if (!audio) {
        throw new Error('Audio is required.');
      }

      const audioBuffer = await audio.toBuffer();
      const audioAsBase64 = audioBuffer.toString('base64');

      const transcription = await transcribeAudio(
        audioAsBase64,
        audio.mimetype
      );
      const embeddings = await generateEmbedding(transcription);

      const result = await db
        .insert(schema.audioChunks)
        .values({
          roomId,
          transcription,
          embeddings,
        })
        .returning();

      const chunks = result[0];

      if (!chunks) {
        throw new Error('Ckunk problem');
      }

      reply.status(201).send({
        chunkId: chunks.id,
      });
    }
  );
};
