import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const filePath = path.join(UPLOAD_ROOT, ...params.path);
  // Voorkom path traversal buiten de uploads map
  if (!filePath.startsWith(UPLOAD_ROOT + path.sep)) {
    return new NextResponse('Not found', { status: 404 });
  }
  try {
    const data = await readFile(filePath);
    const contentType = CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
