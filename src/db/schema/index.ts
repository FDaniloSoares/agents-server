// conceito BARREL FILE (um arquivo que exportas todos os outros dentro da pasta)
import { audioChunks } from './audio-chunks.ts';
import { questions } from './questions.ts';
import { rooms } from './rooms.ts';

export const schema = {
  rooms,
  questions,
  audioChunks,
};
