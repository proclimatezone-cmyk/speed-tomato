import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get('size');
  const size = sizeParam ? parseInt(sizeParam, 10) : 15 * 1024 * 1024; // 15MB по умолчанию для хорошего замера

  const chunkSize = 65536; // 64KB
  const chunk = new Uint8Array(chunkSize);
  for (let i = 0; i < chunkSize; i++) {
    chunk[i] = Math.floor(Math.random() * 256);
  }

  let bytesSent = 0;

  const stream = new ReadableStream({
    pull(controller) {
      if (bytesSent >= size) {
        controller.close();
        return;
      }
      const remaining = size - bytesSent;
      const currentChunkSize = Math.min(chunkSize, remaining);
      
      if (currentChunkSize === chunkSize) {
        controller.enqueue(chunk);
      } else {
        controller.enqueue(chunk.subarray(0, currentChunkSize));
      }
      bytesSent += currentChunkSize;
    }
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': size.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
