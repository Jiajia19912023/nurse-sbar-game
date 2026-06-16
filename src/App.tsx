import { useState } from 'react';
import type { Screen, Gender, Feedback } from './types';
import { getQuestions, getIntroScenes } from './data/questions';
import { sound, initAudio } from './utils/sound';

/** ブラウザのオーディオポリシー解除（初回ユーザー操作時に呼ぶ） */
function unlockAudio() {
  initAudio();
}

/* ── セーブデータ ── */
const SAVE_KEY = 'nurse-game-save';

interface SaveData {
  gender: Gender;
  playerName: string;
  qIdx: number;
  mental: number;
}

function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeSave(data: SaveData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

const CHART_INFO = `患者名：田中さん
年齢：80代　性別：男性
診断：COPD急性増悪疑い
主訴：呼吸困難
意識：清明
性格：やや頑固。「大丈夫」と言いがち
家族：80代の妻がよく面会に来る。子どもはほとんど来ない。

【病態メモ】
COPDでは気道狭窄や肺胞破壊により、
特に息を吐き出しにくくなる。
急性増悪では、咳・痰の増加・wheeze・
呼吸困難・SpO2低下・RR上昇に注意する。
CO2貯留リスクがあるため、酸素投与は
指示や施設プロトコルを確認して行う。
SpO2だけで判断せず、RR・呼吸努力・
会話可能性・意識状態・呼吸音を総合して見る。`;

const VITALS_INFO = `時刻：10:00
体温：37.8℃
心拍数：116 /min
血圧：146/82 mmHg
呼吸数：30 /min
SpO2：88% room air
意識：清明
呼吸状態：短文なら会話可能、wheezeあり
痰：黄色痰あり`;

function getMentalColor(val: number) {
  if (val >= 70) return 'bg-blue-500';
  if (val >= 40) return 'bg-yellow-400';
  return 'bg-red-500';
}
function playerNormal(g: Gender) {
  return g === 'female' ? '/assets/female_nurse_normal.png' : '/assets/male_nurse_normal.png';
}
function playerSad(g: Gender) {
  return g === 'female' ? '/assets/female_nurse_sad.png' : '/assets/male_nurse_sad.png';
}

/* ── モーダル ── */
function Modal({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-4 w-full max-w-xs overflow-y-auto shadow-2xl" style={{ maxHeight: '80%' }} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-bold text-blue-800 mb-2">{title}</h2>
        <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{body}</pre>
        <button onClick={onClose} className="mt-3 w-full bg-blue-600 text-white py-2 rounded-xl font-bold text-xs">閉じる</button>
      </div>
    </div>
  );
}

/* ── HUDアイコン（バイタル取得後に表示） ── */
function HudIcons({ onChart, onVitals }: { onChart: () => void; onVitals: () => void }) {
  return (
    <div className="absolute top-2 right-2 z-30 flex gap-1">
      <button onClick={onChart} className="bg-white/90 rounded-lg px-2 py-1 text-xs font-bold text-blue-700 shadow">📋 カルテ</button>
      <button onClick={onVitals} className="bg-white/90 rounded-lg px-2 py-1 text-xs font-bold text-blue-700 shadow">💊 バイタル</button>
    </div>
  );
}

/* ── メンタルゲージ ── */
function MentalGauge({ value, onChart, onVitals, onSave, saved }: {
  value: number; onChart: () => void; onVitals: () => void; onSave: () => void; saved: boolean;
}) {
  const color = getMentalColor(value);
  return (
    <div className="absolute top-2 left-2 right-2 z-30 flex items-center gap-1.5">
      <div className="flex-1 bg-white/70 rounded-full h-3 overflow-hidden shadow">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-white text-xs font-bold bg-black/50 px-1.5 py-0.5 rounded whitespace-nowrap">♥ {value}</span>
      <button onClick={onChart} className="bg-white/90 rounded px-1.5 py-0.5 text-xs font-bold text-blue-700 shadow">📋</button>
      <button onClick={onVitals} className="bg-white/90 rounded px-1.5 py-0.5 text-xs font-bold text-blue-700 shadow">💊</button>
      <button
        onClick={onSave}
        className={`rounded px-1.5 py-0.5 text-xs font-bold shadow transition-all ${saved ? 'bg-green-400 text-white' : 'bg-white/90 text-gray-600'}`}
        title="セーブ"
      >
        {saved ? '✓保存' : '💾'}
      </button>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [gender, setGender] = useState<Gender | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [qIdx, setQIdx] = useState(0);
  const [mental, setMental] = useState(100);
  const [showChart, setShowChart] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [introIdx, setIntroIdx] = useState(0);
  const [savedData] = useState<SaveData | null>(() => loadSave());
  const [justSaved, setJustSaved] = useState(false);

  // 主人公の性別に応じて問題・イントロを生成（同期キャラは逆性別になる）
  const questions = getQuestions(gender ?? 'female');
  const introScenes = getIntroScenes(playerName || 'あなた', gender ?? 'female');
  const q = questions[qIdx];
  // バイタル取得は最後のイントロシーンで実施 → そこから解放
  const vitalsUnlocked = (screen === 'intro' && introIdx >= introScenes.length - 1) || screen === 'game';

  function reset() {
    deleteSave();
    sound.click();
    sound.stopBGM();
    setScreen('title'); setMental(100); setQIdx(0); setIntroIdx(0);
    setFeedback(null); setGender(null);
    setPlayerName(''); setNameInput('');
  }

  function handleSave() {
    if (!gender) return;
    writeSave({ gender, playerName, qIdx, mental });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  function resumeGame() {
    if (!savedData) return;
    sound.click();
    setGender(savedData.gender);
    setPlayerName(savedData.playerName);
    setQIdx(savedData.qIdx);
    setMental(savedData.mental);
    setFeedback(null);
    setIntroIdx(0);
    setScreen('game');
  }

  function confirmName() {
    sound.click();
    const trimmed = nameInput.trim();
    setPlayerName(trimmed || '看護師');
    setScreen('intro');
  }

  function pickChoice(choiceId: string) {
    sound.click();
    const choice = q.choices.find((c) => c.id === choiceId)!;
    if (choice.isCorrect) {
      sound.correct();
      setFeedback({ type: 'correct', text: q.correctExplanation });
    } else {
      sound.wrong();
      const newM = Math.max(0, mental - 10);
      setMental(newM);
      setFeedback({ type: 'wrong', text: q.wrongExplanations[choiceId] || '不正解です。', wrongChoiceId: choiceId });
      if (newM <= 0) setTimeout(() => { setFeedback(null); sound.gameOver(); sound.switchToGameOver(); setScreen('gameover'); }, 1800);
    }
  }

  function next() {
    sound.click();
    if (feedback?.type === 'correct') {
      setFeedback(null);
      if (qIdx >= questions.length - 1) {
        deleteSave(); // クリア時はセーブ削除
        sound.clear();
        sound.switchToClear(); // 最終画面：明るいBGMへ
        setScreen('clear');
      } else {
        const nextIdx = qIdx + 1;
        setQIdx(nextIdx);
        // 次の問題に進む時点でセーブ
        if (gender) {
          writeSave({ gender, playerName, qIdx: nextIdx, mental });
        }
      }
    } else {
      setFeedback(null);
    }
  }

  function charSrcForQ(): string | null {
    if (!feedback) return q.character;
    if (feedback.type === 'correct' && q.characterAfterCorrect !== undefined) return q.characterAfterCorrect;
    if (feedback.type === 'wrong' && gender) return playerSad(gender);
    return q.character;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-5xl rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>

        {showChart && <Modal title="📋 患者カルテ" body={CHART_INFO} onClose={() => setShowChart(false)} />}
        {showVitals && <Modal title="💊 バイタルサイン" body={VITALS_INFO} onClose={() => setShowVitals(false)} />}

        {/* ===== タイトル画面 ===== */}
        {screen === 'title' && (
          <div className="absolute inset-0">
            <img src="/assets/title.png" alt="新人ナース、報告します！" className="absolute inset-0 w-full h-full object-cover" />
            {/* ボタン群：白枠内の下部 */}
            <div className="absolute left-0 right-0 flex flex-col items-center gap-2" style={{ bottom: '8%' }}>
              {savedData ? (
                // セーブデータあり → 続きから / はじめから
                <>
                  <button
                    onClick={() => { unlockAudio(); sound.startBGM(); resumeGame(); }}
                    className="bg-blue-600 text-white text-sm font-black px-7 py-2.5 rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all border-2 border-blue-400"
                  >
                    📖 続きから（Q{savedData.qIdx + 1}/10　♥{savedData.mental}）
                  </button>
                  <button
                    onClick={() => { sound.click(); deleteSave(); setScreen('select'); }}
                    className="text-blue-600 text-xs font-bold bg-white/70 border border-blue-200 px-5 py-1.5 rounded-full shadow hover:bg-white active:scale-95 transition-all"
                  >
                    はじめから
                  </button>
                </>
              ) : (
                // セーブなし → タップして始める
                <>
                  <div className="flex gap-3 text-blue-400 text-xl animate-bounce">
                    <span>▼</span><span>▼</span><span>▼</span>
                  </div>
                  <button
                    onClick={() => { unlockAudio(); sound.title(); sound.startBGM(); setScreen('select'); }}
                    className="text-blue-700 text-sm font-black bg-white/80 border-2 border-blue-300 px-6 py-2 rounded-full shadow-lg animate-pulse tracking-wide"
                  >
                    🩺 タップして始める 🩺
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ===== 主人公選択 ===== */}
        {screen === 'select' && (
          <>
            <img src="/assets/entrance.png" alt="bg" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-blue-900/55" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4">
              <div className="bg-white/95 rounded-2xl px-6 py-3 text-center shadow-xl">
                <h2 className="text-lg font-black text-blue-900 mb-0.5">主人公を選んでください</h2>
                <p className="text-xs text-gray-500">あなたはどちらの新人看護師？</p>
              </div>
              <div className="flex gap-4 sm:gap-8">
                {[
                  { g: 'female' as Gender, label: '女性主人公', src: '/assets/female_nurse_normal.png', border: 'border-pink-300 hover:border-pink-500' },
                  { g: 'male' as Gender, label: '男性主人公', src: '/assets/male_nurse_normal.png', border: 'border-blue-300 hover:border-blue-500' },
                ].map(({ g, label, src, border }) => (
                  <button key={g} onClick={() => { sound.click(); setGender(g); setScreen('name'); }}
                    className={`bg-white rounded-2xl p-3 shadow-xl border-2 ${border} active:scale-95 transition-all flex flex-col items-center gap-1`}>
                    <img src={src} alt={label} className="h-28 sm:h-36 object-contain" />
                    <span className="font-bold text-gray-700 text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== 名前入力 ===== */}
        {screen === 'name' && gender && (
          <>
            <img src="/assets/entrance.png" alt="bg" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-blue-900/55" />
            {/* キャラクター */}
            <div className="absolute left-0 right-0 flex justify-center items-end" style={{ top: '2%', bottom: '28%' }}>
              <img src={playerNormal(gender)} alt="player" className="max-h-full object-contain drop-shadow-2xl" />
            </div>
            {/* 名前入力ボックス */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="bg-white rounded-xl p-4 shadow-2xl">
                <p className="text-sm font-bold text-blue-800 mb-1 text-center">あなたの名前を教えてください</p>
                <p className="text-xs text-gray-500 mb-3 text-center">（省略した場合は「看護師」として進みます）</p>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmName()}
                  placeholder="例：田村　さくら"
                  maxLength={10}
                  className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 text-base text-gray-800 focus:outline-none focus:border-blue-500 text-center"
                  autoFocus
                />
                <button onClick={confirmName} className="mt-3 w-full bg-blue-600 text-white py-2.5 rounded-xl font-black text-base hover:bg-blue-700 active:scale-95 transition-all">
                  {nameInput.trim() ? `「${nameInput.trim()}」で始める →` : 'このまま始める →'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ===== イントロ ===== */}
        {screen === 'intro' && gender && (() => {
          const sc = introScenes[introIdx];
          const isLast = introIdx >= introScenes.length - 1;
          const charSrc = sc.character !== undefined ? sc.character : playerNormal(gender);
          return (
            <>
              <img src={sc.background} alt="bg" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
              {/* カルテ・バイタルはバイタル取得後のみ表示 */}
              {vitalsUnlocked && <HudIcons onChart={() => setShowChart(true)} onVitals={() => setShowVitals(true)} />}
              {/* キャラクター */}
              {charSrc && (
                <div className="absolute left-0 right-0 flex justify-center items-end" style={{ top: '2%', bottom: '22%' }}>
                  <img src={charSrc} alt="char" className="max-h-full object-contain drop-shadow-2xl" />
                </div>
              )}
              {/* テキストボックス */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="bg-white rounded-xl p-3 shadow-2xl">
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line">{sc.text}</p>
                  <button
                    onClick={() => {
                      sound.click();
                      if (isLast) {
                        if (gender) writeSave({ gender, playerName, qIdx: 0, mental: 100 });
                        setScreen('game');
                      } else {
                        const nextIdx = introIdx + 1;
                        setIntroIdx(nextIdx);
                        // 最後のシーン（バイタル測定・異常発見）に切り替わる瞬間に緊張BGMへ
                        if (nextIdx === introScenes.length - 1) {
                          sound.switchToTense();
                        }
                      }
                    }}
                    className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    {isLast ? 'ゲーム開始 →' : '次へ →'}
                  </button>
                </div>
              </div>
            </>
          );
        })()}

        {/* ===== ゲーム画面 ===== */}
        {screen === 'game' && gender && (
          <>
            <img src={q.background} alt="bg" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <MentalGauge value={mental} onChart={() => setShowChart(true)} onVitals={() => setShowVitals(true)} onSave={handleSave} saved={justSaved} />

            {/* キャラクター：nullなら非表示（Q7・Q8・Q10等） */}
            {(() => {
              const src = charSrcForQ();
              if (!src) return null;
              return (
                <div className="absolute left-0 right-0 flex justify-center items-end" style={{ top: '8%', bottom: '26%' }}>
                  <img src={src} alt="char" className="max-h-full object-contain drop-shadow-2xl" />
                </div>
              );
            })()}

            {/* 問題 or フィードバック */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
              {!feedback && (
                <>
                  <div className="bg-white rounded-xl px-3 py-2 shadow-xl mb-1.5">
                    <p className="text-xs font-bold text-blue-500 mb-0.5">Q{qIdx + 1}/{questions.length}　{q.scene}</p>
                    <p className="text-xs sm:text-sm text-gray-800 leading-snug whitespace-pre-line">{q.question}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {q.choices.map((c) => (
                      <button key={c.id} onClick={() => pickChoice(c.id)}
                        className="bg-white text-left px-3 py-2 rounded-lg shadow text-xs sm:text-sm text-gray-800 hover:bg-blue-50 active:scale-[.98] transition-all flex gap-2 items-start">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">{c.id}</span>
                        <span className="leading-snug">{c.text}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {feedback?.type === 'correct' && (
                <div className="bg-white rounded-xl px-3 py-3 shadow-xl border-2 border-green-400">
                  <p className="text-green-600 font-black text-sm mb-1">✅ 正解！</p>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{feedback.text}</p>
                  <button onClick={next} className="mt-2 w-full bg-green-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-600 active:scale-95 transition-all">
                    {qIdx >= questions.length - 1 ? 'クリア！ 🎉' : '次へ →'}
                  </button>
                </div>
              )}
              {feedback?.type === 'wrong' && mental > 0 && (
                <div className="bg-white rounded-xl px-3 py-3 shadow-xl border-2 border-red-400">
                  <p className="text-red-600 font-black text-sm mb-1">❌ 不正解</p>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{feedback.text}</p>
                  <p className="text-red-500 font-bold text-xs mt-1">メンタルが10下がった。（残り {mental}/100）</p>
                  <button onClick={next} className="mt-2 w-full bg-orange-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-orange-600 active:scale-95 transition-all">
                    もう一度考える →
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== ゲームオーバー ===== */}
        {screen === 'gameover' && gender && (
          <>
            <img src="/assets/entrance.png" alt="bg" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gray-900/65" />
            <div className="absolute inset-0 flex items-center justify-center gap-6 px-6">
              <img src={playerSad(gender)} alt="sad" className="h-48 sm:h-56 object-contain drop-shadow-2xl shrink-0" />
              <div className="bg-white rounded-2xl px-5 py-5 shadow-2xl max-w-xs">
                <p className="text-2xl font-black text-red-600 mb-2">GAME OVER</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {playerName}さん、メンタルゲージが0になりました。<br />一度タイトルに戻って、もう一度挑戦しましょう。
                </p>
                <button onClick={reset} className="mt-4 w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all">
                  タイトルに戻る
                </button>
              </div>
            </div>
          </>
        )}

        {/* ===== クリア画面 ===== */}
        {screen === 'clear' && gender && (
          <>
            <img src="/assets/hallway.png" alt="bg" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-blue-900/40" />
            {/* 主人公キャラ（選択したキャラで統一） */}
            <div className="absolute left-0 right-0 flex justify-center items-end" style={{ top: '3%', bottom: '32%' }}>
              <img src={playerNormal(gender)} alt="player" className="max-h-full object-contain drop-shadow-2xl" />
            </div>
            {/* テキストボックス */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="bg-white rounded-xl px-4 py-4 shadow-2xl">
                <p className="text-lg font-black text-blue-800 mb-2 text-center">✨ 第1章クリア ✨</p>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  {playerName}さんは田中さんの変化に気づき、先輩と医師へ適切に報告することができた。
                </p>
                <p className="text-sm text-gray-800 italic leading-relaxed font-medium mb-1">
                  「怖かったけど…ちゃんと言えた。
                </p>
                <p className="text-sm text-gray-800 italic leading-relaxed font-medium mb-3">
                  　データを見て、動く。それが私にできることだった」
                </p>
                <p className="text-xs text-blue-600 font-bold mb-3 text-center">患者安全を守る判断ができました。</p>
                <button onClick={reset} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all">
                  タイトルに戻る
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
