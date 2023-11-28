import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import { writer } from '../ctrls/writer';
import { generateArticle } from '../ctrls/generateArticle';

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
    return { hello: 'world' };
  });

  server.post('/write', {
    schema: {
      response: {
        200: Type.Object({
          status: Type.String(),
        }),
      },
    },
  }, writer);

  server.post('/generate-article', {
    schema: {
      response: {
        200: Type.Object({
          title: Type.String(),
          content: Type.String(),
          urls: Type.Array(Type.String())
        }),
      },
    },
  }, generateArticle);
}

export default routes;
