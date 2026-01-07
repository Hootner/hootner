import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export const streamFile = async (source, dest) => { await pipeline(createReadStream(source), createWriteStream(dest)); };

export const streamResponse = (filePath, res) => { const stream = createReadStream(filePath, { highWaterMark: 64 * 1024 });
  stream.pipe(res);
  stream.on('error', () => res.status(500).end()); };
