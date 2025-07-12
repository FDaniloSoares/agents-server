import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import { db } from '../../db/conection.ts';
import { schema } from '../../db/schema/index.ts';

export const createRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms',
    {
      schema: {
        body: z.object({
          name: z.string().min(1),
          description: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { name, description } = request.body;

      // for defaul the pg retouns after a insert a array and a array of number of inserted lines
      // for return elementes use returnig funcion
      const result = await db
        .insert(schema.rooms)
        .values({
          name,
          description,
        })
        .returning();

      const insertedRoom = result[0];

      if (!insertedRoom) {
        throw new Error('Faild to create new room');
      }

      return reply.status(201).send({
        roomId: insertedRoom.id,
      });
    }
  );
};
