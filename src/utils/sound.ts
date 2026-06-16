/**
 * Web Audio API 効果音 + BGM
 * iOS/Android 対応版
 *
 * ポイント:
 * - AudioContext は最初のユーザー操作で同期的に生成 (initAudio)
 * - await を使わない設計で iOS Safari のポリシーに対応
 * - BGM は ambient/tense の2系統を常時起動しゲインでクロスフェード
 */

let ctx: AudioContext | null = null;

/** 最初のタップ/クリックで呼ぶ。同期的にコンテキストを起動する */
export function initAudio(): AudioContext {
  if (!ctx) {
    const ACtx = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new ACtx();
  }
  // iOS は suspended で始まることがある → resume() はプロミスだが await しない
  if (ctx.state === 'suspended') { void ctx.resume(); }
  return ctx;
}

function ac(): AudioContext {
  return ctx ?? initAudio();
}

/* ─────────────────────────────────────
   効果音（tone）
───────────────────────────────────── */
function tone(freq: number, dur: number, wave: OscillatorType = 'sine', vol = 0.3, delay = 0) {
  try {
    const c = ac();
    const osc  = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);
    gain.gain.setValueAtTime(0.001, c.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + dur + 0.06);
  } catch (e) { console.warn('[sound]', e); }
}

export const sound = {
  click:    () => tone(900, 0.06, 'sine', 0.18),
  correct:  () => { tone(523,0.15,'sine',0.30,0); tone(659,0.15,'sine',0.30,0.13); tone(784,0.40,'sine',0.32,0.26); },
  wrong:    () => { tone(300,0.15,'sawtooth',0.20,0); tone(200,0.35,'sawtooth',0.16,0.15); },
  gameOver: () => { tone(392,0.25,'triangle',0.25,0); tone(349,0.25,'triangle',0.25,0.22); tone(330,0.25,'triangle',0.25,0.44); tone(261,0.60,'triangle',0.28,0.66); },
  title:    () => { tone(880,0.28,'sine',0.20,0); tone(1108,0.50,'sine',0.18,0.25); },
  clear:    () => { tone(523,0.14,'sine',0.35,0); tone(659,0.14,'sine',0.35,0.13); tone(784,0.14,'sine',0.35,0.26); tone(1046,0.60,'sine',0.38,0.39); tone(1318,0.50,'sine',0.22,0.44); },
  startBGM,
  stopBGM,
  switchToTense,
  switchToClear,
  switchToGameOver,
  stopTitle: () => {},
};

/* ─────────────────────────────────────
   BGM 共通
   ambient / tense 2系統を常時起動し
   GainNode だけで切り替える
───────────────────────────────────── */
let ambientMaster:  GainNode | null = null;
let tenseMaster:    GainNode | null = null;
let clearMaster:    GainNode | null = null;
let gameoverMaster: GainNode | null = null;
let bgmReady   = false;
let bgmPlaying = false;
type BgmMode = 'ambient' | 'tense' | 'clear' | 'gameover' | 'off';
let currentMode: BgmMode = 'off';

// メロディ・パルスのタイマー
let ambientMelTimer:  ReturnType<typeof setTimeout> | null = null;
let tenseMotifTimer:  ReturnType<typeof setTimeout> | null = null;
let pulseTimer:       ReturnType<typeof setTimeout> | null = null;
let clearMelTimer:    ReturnType<typeof setTimeout> | null = null;
let gameoverMelTimer: ReturnType<typeof setTimeout> | null = null;

/** パッド生成（全オシレーターを起動しておく） */
function buildPad(freqs: number[], lfoRate: number, padVol: number, master: GainNode, c: AudioContext) {
  freqs.forEach((freq, i) => {
    const osc  = c.createOscillator();
    const gain = c.createGain();
    const lfo  = c.createOscillator();
    const lfoG = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = padVol;
    lfo.type = 'sine';
    lfo.frequency.value = lfoRate + i * 0.02;
    lfoG.gain.value = padVol * 0.5;
    lfo.connect(lfoG); lfoG.connect(gain.gain);
    osc.connect(gain); gain.connect(master);
    osc.start(); lfo.start();
  });
}

/** BGMを一度だけセットアップ（最初の startBGM/switchToTense で呼ぶ） */
function ensureBGMReady() {
  if (bgmReady) return;
  bgmReady = true;
  const c = ac();

  ambientMaster = c.createGain();
  ambientMaster.gain.value = 0;
  ambientMaster.connect(c.destination);

  tenseMaster = c.createGain();
  tenseMaster.gain.value = 0;
  tenseMaster.connect(c.destination);

  clearMaster = c.createGain();
  clearMaster.gain.value = 0;
  clearMaster.connect(c.destination);

  gameoverMaster = c.createGain();
  gameoverMaster.gain.value = 0;
  gameoverMaster.connect(c.destination);

  // ── Ambient: Cメジャー・ゆったり ──
  buildPad([130.81, 164.81, 196.00, 261.63], 0.07, 0.22, ambientMaster, c);

  // ── Tense: Aマイナー+半音・速いLFO ──
  buildPad([110.00, 130.81, 155.56, 220.00], 3.5,  0.18, tenseMaster, c);

  // ── Clear: 明るいCメジャー・高め ──
  buildPad([261.63, 329.63, 392.00, 523.25], 0.12, 0.18, clearMaster, c);

  // ── GameOver: 暗いGマイナー・低め ──
  buildPad([98.00, 116.54, 146.83, 196.00], 0.05, 0.20, gameoverMaster, c);
}

/* ─── Ambient メロディ ─── */
const AMBIENT_MELODY: [number, number, number][] = [
  [523.25,0.6,0.0],[587.33,0.6,0.7],[659.25,0.8,1.4],
  [783.99,0.6,2.3],[659.25,0.6,3.0],[523.25,1.2,3.7],
  [440.00,0.6,5.1],[493.88,0.6,5.8],[523.25,1.5,6.5],
];
function runAmbientMelody() {
  if (currentMode !== 'ambient') return;
  AMBIENT_MELODY.forEach(([f,d,dl]) => tone(f, d, 'sine', 0.055, dl));
  ambientMelTimer = setTimeout(runAmbientMelody, 10_000);
}

/* ─── Tense モティーフ ─── */
const TENSE_MOTIF: [number, number, number][] = [
  [220.00,0.30,0.0],[233.08,0.25,0.4],[220.00,0.20,0.75],
  [207.65,0.40,1.05],[196.00,0.60,1.55],
];
function runTenseMotif() {
  if (currentMode !== 'tense') return;
  TENSE_MOTIF.forEach(([f,d,dl]) => tone(f, d, 'triangle', 0.07, dl));
  tenseMotifTimer = setTimeout(runTenseMotif, 8_000);
}

/* ─── 心拍パルス ─── */
const PULSE_INTERVAL_MS = (60 / 90) * 1000; // 90 BPM
function runPulse() {
  if (currentMode !== 'tense') return;
  tone(60, 0.10, 'triangle', 0.18);
  setTimeout(() => { if (currentMode === 'tense') tone(55, 0.08, 'triangle', 0.10); }, 200);
  pulseTimer = setTimeout(runPulse, PULSE_INTERVAL_MS);
}

/* ─── Clear（明るい・希望）メロディ ─── */
const CLEAR_MELODY: [number, number, number][] = [
  [523.25,0.4,0.0],[659.25,0.4,0.45],[783.99,0.4,0.9],[1046.50,0.9,1.35],
  [987.77,0.4,2.4],[1046.50,1.1,2.85],
];
function runClearMelody() {
  if (currentMode !== 'clear') return;
  CLEAR_MELODY.forEach(([f,d,dl]) => tone(f, d, 'sine', 0.06, dl));
  clearMelTimer = setTimeout(runClearMelody, 9_000);
}

/* ─── GameOver（暗い・下降）メロディ ─── */
const GAMEOVER_MELODY: [number, number, number][] = [
  [220.00,0.8,0.0],[196.00,0.8,0.9],[174.61,0.9,1.8],[146.83,1.6,2.8],
];
function runGameoverMelody() {
  if (currentMode !== 'gameover') return;
  GAMEOVER_MELODY.forEach(([f,d,dl]) => tone(f, d, 'triangle', 0.06, dl));
  gameoverMelTimer = setTimeout(runGameoverMelody, 11_000);
}

function clearTimers() {
  if (ambientMelTimer)  { clearTimeout(ambientMelTimer);  ambientMelTimer  = null; }
  if (tenseMotifTimer)  { clearTimeout(tenseMotifTimer);  tenseMotifTimer  = null; }
  if (pulseTimer)       { clearTimeout(pulseTimer);       pulseTimer       = null; }
  if (clearMelTimer)    { clearTimeout(clearMelTimer);    clearMelTimer    = null; }
  if (gameoverMelTimer) { clearTimeout(gameoverMelTimer); gameoverMelTimer = null; }
}

/* ─────────────────────────────────────
   公開関数
───────────────────────────────────── */

/** 通常BGM開始 */
function startBGM() {
  if (currentMode === 'ambient' && bgmPlaying) return;
  ensureBGMReady();
  bgmPlaying = true;
  currentMode = 'ambient';
  const c = ac();
  const now = c.currentTime;

  if (tenseMaster)   { tenseMaster.gain.cancelScheduledValues(now); tenseMaster.gain.linearRampToValueAtTime(0, now + 0.5); }
  if (ambientMaster) { ambientMaster.gain.cancelScheduledValues(now); ambientMaster.gain.linearRampToValueAtTime(0.08, now + 3.0); }

  clearTimers();
  setTimeout(runAmbientMelody, 3_000);
}

/** 緊張BGMへ切り替え（await なし・同期安全） */
function switchToTense() {
  if (currentMode === 'tense') return;
  ensureBGMReady();
  bgmPlaying = true;
  currentMode = 'tense';
  const c = ac();
  const now = c.currentTime;

  if (ambientMaster) { ambientMaster.gain.cancelScheduledValues(now); ambientMaster.gain.linearRampToValueAtTime(0, now + 1.2); }
  if (tenseMaster)   { tenseMaster.gain.cancelScheduledValues(now);   tenseMaster.gain.linearRampToValueAtTime(0.10, now + 2.0); }

  clearTimers();
  setTimeout(runTenseMotif, 2_000);
  setTimeout(runPulse, 1_500);
}

/** クリア画面：明るいBGMへ切り替え（最終画面のみ） */
function switchToClear() {
  if (currentMode === 'clear') return;
  ensureBGMReady();
  bgmPlaying = true;
  currentMode = 'clear';
  const c = ac();
  const now = c.currentTime;
  if (ambientMaster)  { ambientMaster.gain.cancelScheduledValues(now);  ambientMaster.gain.linearRampToValueAtTime(0, now + 0.8); }
  if (tenseMaster)    { tenseMaster.gain.cancelScheduledValues(now);    tenseMaster.gain.linearRampToValueAtTime(0, now + 0.8); }
  if (gameoverMaster) { gameoverMaster.gain.cancelScheduledValues(now); gameoverMaster.gain.linearRampToValueAtTime(0, now + 0.8); }
  if (clearMaster)    { clearMaster.gain.cancelScheduledValues(now);    clearMaster.gain.linearRampToValueAtTime(0.10, now + 1.5); }
  clearTimers();
  setTimeout(runClearMelody, 500);
}

/** ゲームオーバー画面：暗く低いBGMへ切り替え（最終画面のみ） */
function switchToGameOver() {
  if (currentMode === 'gameover') return;
  ensureBGMReady();
  bgmPlaying = true;
  currentMode = 'gameover';
  const c = ac();
  const now = c.currentTime;
  if (ambientMaster) { ambientMaster.gain.cancelScheduledValues(now); ambientMaster.gain.linearRampToValueAtTime(0, now + 1.0); }
  if (tenseMaster)   { tenseMaster.gain.cancelScheduledValues(now);   tenseMaster.gain.linearRampToValueAtTime(0, now + 1.0); }
  if (clearMaster)   { clearMaster.gain.cancelScheduledValues(now);   clearMaster.gain.linearRampToValueAtTime(0, now + 1.0); }
  if (gameoverMaster){ gameoverMaster.gain.cancelScheduledValues(now);gameoverMaster.gain.linearRampToValueAtTime(0.11, now + 1.8); }
  clearTimers();
  setTimeout(runGameoverMelody, 600);
}

/** BGM停止 */
function stopBGM() {
  currentMode = 'off';
  bgmPlaying = false;
  clearTimers();
  const c = ac();
  const now = c.currentTime;
  if (ambientMaster)  ambientMaster.gain.linearRampToValueAtTime(0, now + 1.5);
  if (tenseMaster)    tenseMaster.gain.linearRampToValueAtTime(0, now + 1.5);
  if (clearMaster)    clearMaster.gain.linearRampToValueAtTime(0, now + 1.5);
  if (gameoverMaster) gameoverMaster.gain.linearRampToValueAtTime(0, now + 1.5);
  // 次回 startBGM 時に再フェードインできるよう bgmReady はリセットしない
}
