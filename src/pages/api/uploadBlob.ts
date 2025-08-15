import { put } from '@vercel/blob';
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse form with formidable
const parseForm = async (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const formidable = await import('formidable');
  const form = formidable.default({ multiples: false }); // Use `default` for ESM import

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    const { files } = await parseForm(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !file.filepath || !file.originalFilename) {
      return res.status(400).json({ error: 'File not found or invalid' });
    }

    const stream = fs.createReadStream(file.filepath);

    const blob = await put(file.originalFilename, stream, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error: any) {
    return res.status(500).json({ error: 'Upload failed', details: error.message || error });
  }
}
