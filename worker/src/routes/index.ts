import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import { vocab } from '../ctrls/vocab';
import { addVocabs } from '../ctrls/addVocabs';

const routes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    schema: {
      response: {
        200: Type.Object({
          hello: Type.String(),
        }),
      },
    },
  }, async function () {
    return { hello: 'work server' };
  });

  server.post('/vocab', {
    schema: {
      response: {
        200: Type.Object({
          status: Type.String(),
          vocabs: Type.Array(Type.Object({
            word: Type.String(),
            pronounce: Type.String(),
            pos: Type.String(),
            level: Type.String(),
            meaning: Type.String(),
            sentence: Type.String(),
            meaningInJapanese: Type.String(),
            example: Type.String(),
          }))
        }),
      },
    },
  }, vocab);

  server.post('/add-vocabs', {
    schema: {
      request: {
        body: Type.Object({
          materialId: Type.String(),
          url: Type.String(),
        }),
      },
      response: {
        200: Type.Object({
          status: Type.String(),
          vocabs: Type.Array(Type.Object({
            word: Type.String(),
            pronounce: Type.String(),
            pos: Type.String(),
            level: Type.String(),
            meaning: Type.String(),
            sentence: Type.String(),
            meaningInJapanese: Type.String(),
            example: Type.String(),
          }))
        }),
      },
    },
  }, addVocabs);
}

export default routes;
