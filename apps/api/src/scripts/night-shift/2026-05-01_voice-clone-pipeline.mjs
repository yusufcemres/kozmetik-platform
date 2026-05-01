// Voice Clone Podcast Pipeline — ElevenLabs ile MP3 üretim
// Kullanım: VOICE_ID + ELEVENLABS_API_KEY + script.txt → output.mp3

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

// Memory'den
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_c12e839a9b924da6b8dd96d2b591df19867643e4d5ca55c3';
const VOICE_ID = process.env.VOICE_ID; // Patron kendi voice ID'sini set eder

if (!VOICE_ID) {
  console.error('HATA: VOICE_ID ortam değişkeni gerekli.');
  console.error('Kullanım: VOICE_ID=xyz123 node 2026-05-01_voice-clone-pipeline.mjs <script.md>');
  console.error('\nVoice ID al:');
  console.error('  1. https://elevenlabs.io → Voices → Voice Lab');
  console.error('  2. Add Voice → Instant Voice Cloning');
  console.error('  3. Kayıt yükle (1-3 dk WAV/MP3)');
  console.error('  4. Kaydedilen voice"un detay sayfasında ID görünür');
  process.exit(1);
}

const scriptPath = process.argv[2];
if (!scriptPath || !existsSync(scriptPath)) {
  console.error('HATA: Script dosyası belirt.');
  console.error('Kullanım: node 2026-05-01_voice-clone-pipeline.mjs path/to/script.md');
  process.exit(1);
}

// Script'ten parantezli yönergeleri temizle, sadece konuşulan metni al
const raw = readFileSync(scriptPath, 'utf-8');

// "## SES ÖRNEĞI METNI" başlığından sonrasını al, "---" satırına kadar
const m = raw.match(/## SES ÖRNEĞI METNI[\s\S]*?\n([\s\S]+?)\n---/);
if (!m) {
  console.error('HATA: Script formatı tanınmadı. "## SES ÖRNEĞI METNI" başlığı + "---" sonu gerek.');
  process.exit(1);
}

let speakable = m[1]
  .replace(/\[.*?\]/g, '')        // [müzik fade-in], [pause] vb.
  .replace(/\*\*/g, '')            // **bold** kaldır
  .replace(/^#+\s.*$/gm, '')       // markdown başlıkları
  .replace(/^\s*$/gm, '')          // boş satırlar
  .replace(/\n{3,}/g, '\n\n')      // 3+ newline → 2
  .trim();

const charCount = speakable.length;
const estimatedMinutes = (charCount / 1100).toFixed(1); // ~1100 char/dk Türkçe
const estimatedCostUSD = (charCount * 0.0001).toFixed(3); // $0.10/1K char creator

console.log(`Karakter sayısı: ${charCount}`);
console.log(`Tahmini süre: ${estimatedMinutes} dakika`);
console.log(`Tahmini maliyet: $${estimatedCostUSD} (creator plan)`);
console.log('');

// ElevenLabs API çağır
console.log(`ElevenLabs API çağrılıyor (voice ID: ${VOICE_ID.slice(0, 8)}...)...`);

const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
const body = {
  text: speakable,
  model_id: 'eleven_multilingual_v2',
  voice_settings: {
    stability: 0.45,
    similarity_boost: 0.75,
    style: 0.30,
    use_speaker_boost: true,
  },
};

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'xi-api-key': ELEVENLABS_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

if (!res.ok) {
  const err = await res.text();
  console.error(`HATA (${res.status}): ${err}`);
  process.exit(1);
}

const audioBuffer = Buffer.from(await res.arrayBuffer());
const outDir = resolve(__dirname, '../../../../../podcast-pilot/v4-monolog/audio');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const outPath = resolve(outDir, scriptPath.split(/[\\/]/).pop().replace('.md', '.mp3'));
writeFileSync(outPath, audioBuffer);

console.log(`✓ MP3 yazıldı: ${outPath}`);
console.log(`  Boyut: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`\nSonraki adım:`);
console.log(`  1. MP3'ü dinle, kalite kontrol`);
console.log(`  2. Suno ile intro/outro müzik üret (memory: WF-YT3 Ambient Music Pipeline)`);
console.log(`  3. Audacity/FFmpeg ile birleştir`);
console.log(`  4. Spotify for Podcasters'a yükle (rehber: podcast-pilot/SPOTIFY_DEPLOY_REHBERI.md)`);
