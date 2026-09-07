import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load keys from ../.env (since this is run inside scripts/)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const SARVAM_API_KEY = process.env.SARVAM_API_KEY!;
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID!;
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

const LOCALES_DIR = path.join(__dirname, '../locales');
const MANIFEST_PATH = path.join(__dirname, '../assets/audio_manifest.json');

const LANG_MAP: Record<string, string> = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'bn': 'bn-IN',
};

const SPEAKER_MAP: Record<string, string> = {
  'en': 'shubh',
  'hi': 'ritu',
  'bn': 'roopa',
};

async function generateAudioForText(text: string, langCode: string, speaker: string): Promise<Buffer> {
  const response = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': SARVAM_API_KEY,
    },
    body: JSON.stringify({
      inputs: [text],
      target_language_code: langCode,
      speaker: speaker,
      pitch: 0,
      pace: 1.0,
      loudness: 1.5,
      speech_sample_rate: 8000,
      enable_preprocessing: true,
      model: 'bulbul:v3'
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Sarvam API Error: ${err}`);
  }

  const data = await response.json();
  const base64Audio = data.audios[0];
  return Buffer.from(base64Audio, 'base64');
}

async function uploadToR2(key: string, audioBuffer: Buffer): Promise<string> {
  const params = {
    Bucket: R2_BUCKET,
    Key: key,
    Body: audioBuffer,
    ContentType: 'audio/wav',
    // Removed ACL because it might not be supported by this specific R2 bucket config
  };
  await s3.send(new PutObjectCommand(params));
  return `https://pub-${R2_ACCOUNT_ID}.r2.dev/${key}`; // Assuming public bucket routing, if not we use presigned in app
}

async function main() {
  console.log('Starting TTS Generation...');
  
  let manifest: Record<string, string> = {};
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  }

  const localeFiles = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));

  for (const file of localeFiles) {
    const lang = file.replace('.json', '');
    const sarvamLang = LANG_MAP[lang];
    if (!sarvamLang) continue;

    console.log(`\nProcessing language: ${lang}`);
    const strings = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, file), 'utf-8'));

    for (const [key, text] of Object.entries(strings)) {
      const audioKey = `${lang}_${key}.wav`;
      
      // Skip if already in manifest
      if (manifest[audioKey]) {
        console.log(`[SKIP] ${audioKey} already generated.`);
        continue;
      }

      console.log(`[GEN] ${audioKey} -> "${text}"`);
      try {
        const speaker = SPEAKER_MAP[lang];
        const audioBuffer = await generateAudioForText(text as string, sarvamLang, speaker);
        
        // Save locally to assets/audio instead of R2 to guarantee offline functionality
        const audioDir = path.join(__dirname, '../assets/audio');
        if (!fs.existsSync(audioDir)) {
          fs.mkdirSync(audioDir, { recursive: true });
        }
        fs.writeFileSync(path.join(audioDir, audioKey), audioBuffer);
        console.log(`  Saved locally to assets/audio/${audioKey}.`);
        
        // Update manifest with local path format (e.g. require('../assets/audio/en_hello.wav'))
        // We will just store the filename in manifest, the app will resolve it.
        manifest[audioKey] = audioKey;

        // Add a delay to avoid rate limits (2s)
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error(`  [ERROR] Failed to generate/upload ${audioKey}:`, err);
      }
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log('\n✅ Done! Manifest updated.');

  // Generate index.ts for static Metro requires
  let indexTsContent = "export const AudioAssets: Record<string, any> = {\n";
  for (const key of Object.keys(manifest)) {
    indexTsContent += `  '${key}': require('./${manifest[key]}'),\n`;
  }
  indexTsContent += "};\n";
  fs.writeFileSync(path.join(__dirname, '../assets/audio/index.ts'), indexTsContent);
  console.log('✅ Generated assets/audio/index.ts');
}

main().catch(console.error);
