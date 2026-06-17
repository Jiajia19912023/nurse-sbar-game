import type { Question, IntroScene, Gender } from '../types';

/** 同期キャラは主人公と逆の性別にする */
function colleagueWord(gender: Gender): string {
  return gender === 'male' ? '女性看護師' : '男性看護師';
}
function colleagueImg(gender: Gender): string {
  return gender === 'male' ? '/assets/female_nurse_normal.png' : '/assets/male_nurse_normal.png';
}

export function getIntroScenes(name: string, gender: Gender): IntroScene[] {
  return [
    {
      background: '/assets/entrance.png',
      character: null,
      text: `春の朝。あおば病院の正面玄関に立つ${name}。\n\n胸には新しいネームプレート。\n入職してまだ2ヶ月。\nまだ何もかもが不安だけど、今日も精一杯やろう——そう自分に言い聞かせた。`,
    },
    {
      background: '/assets/hallway.png',
      character: null,
      text: `病棟への廊下を歩きながら、${name}は今日の受け持ちを頭に思い浮かべた。\n\n4名のうち、一番気になるのが田中さん。\nCOPDで入院中の80代の男性で、昨日から呼吸が少し荒かった。`,
    },
    {
      background: '/assets/nurse_station.png',
      character: '/assets/senior_nurse_strict.png',
      text: `ナースステーションでは先輩の田島さんが申し送りを始めた。\n\n「田中さん、昨夜から呼吸回数が増えてる。朝のバイタル、しっかり見てね」\n\n田島さんは厳しくて少し怖い。でも、言っていることはいつも正しい。`,
    },
    {
      background: '/assets/hallway.png',
      character: colleagueImg(gender),
      text: `廊下で同期の${colleagueWord(gender)}とすれ違った。\n\n「${name}、今日田中さん受け持ちだよね。なんかあったらすぐ先輩に言いなよ。\n　あの人、"大丈夫"が口癖だから気をつけて」\n\n短い言葉が、妙に心に残った。`,
    },
    {
      background: '/assets/patient_room.png',
      character: null,
      text: `田中さんの病室に入ると——\n\nベッドに腰を下ろした田中さんが、胸を押さえてうつむいていた。\n隣では奥さんが心配そうに背中をさすっている。\n\n「田中さん、おはようございます。今日の調子はいかがですか？」\n\n「大丈夫、いつものことだから」`,
    },
    {
      background: '/assets/patient_room.png',
      character: null,
      text: `${name}はバイタルを測った。\n\n体温 37.8℃　心拍数 116 /min\n血圧 146/82 mmHg　呼吸数 30 /min\nSpO2 85% ルームエアー（RA）\n\n呼吸音を確認すると——ヒューヒューという音が聞こえた。\n\n（これは…普通じゃない）`,
    },
  ];
}

export function getQuestions(gender: Gender): Question[] {
  return [
  {
    id: 'q1',
    scene: '先輩への声かけ',
    question:
      '先輩看護師は忙しそうにナースステーションで記録をしている。あなたは田中さんの呼吸状態が気になっているが、先輩は少し怖い。田中さん本人は「大丈夫。いつものことだから」と言っている。\nこの場面で、先輩への声かけとして最も適切なのはどれ？',
    choices: [
      {
        id: 'A',
        text: 'すみません、田中さんの呼吸状態で気になることがあるので、今相談してもいいですか。',
        isCorrect: true,
      },
      {
        id: 'B',
        text: '田中さん、たぶん大丈夫だと思うんですけど、一応見てもらえますか。',
        isCorrect: false,
      },
      {
        id: 'C',
        text: '先輩が忙しそうなので、あと30分様子を見る。',
        isCorrect: false,
      },
    ],
    correctExplanation:
      '正解です。先輩が忙しそうでも、患者本人が「大丈夫」と言っていても、気になる変化があればまず率直に声をかけて相談することが患者安全の第一歩です。具体的なデータの報告は、この次の段階で整理して伝えます。',
    wrongExplanations: {
      B: '「たぶん大丈夫」と前置きすると、せっかくの気づきや懸念が先輩に軽く受け取られてしまう。\n気になる変化があるときは、曖昧にせず率直に相談を切り出すことが大切。',
      C: 'これは危険な判断。\n患者本人が「大丈夫」と言っていても、気になる変化があるなら様子見にせず声をかけるべき。\n先輩が忙しそうでも、患者安全を優先して相談する姿勢が必要。',
    },
    background: '/assets/nurse_station.png',
    character: '/assets/senior_nurse_strict.png',
  },
  {
    id: 'q2',
    scene: '先輩への最初の報告',
    question:
      'あなたは先輩に田中さんの状態を報告することにした。\n先輩への最初の報告として最も適切なのはどれ？',
    choices: [
      {
        id: 'A',
        text: '田中さんが苦しそうです。どうしたらいいですか？',
        isCorrect: false,
      },
      {
        id: 'B',
        text: '田中さん、COPD急性増悪疑いです。SpO2 85%、RR 30、HR 116で、短文会話になっています。呼吸状態が悪化している可能性があるので相談したいです。',
        isCorrect: true,
      },
      {
        id: 'C',
        text: '田中さんが大丈夫と言っているので、もう少し様子を見ます。',
        isCorrect: false,
      },
    ],
    correctExplanation:
      '正解です。診断名（COPD急性増悪疑い）、客観的データ（SpO2、RR、HR）、現在の状態（短文会話）を整理して伝えられています。先輩が即座に重要性を判断できる報告です。',
    wrongExplanations: {
      A: '「苦しそう」は観察としては間違いではないが、報告としては不十分。\nSpO2、RR、HR、会話状態などの客観的データを入れる必要がある。',
      C: '患者の「大丈夫」だけで判断するのは危険。\n高齢患者やCOPD患者は苦しさに慣れていたり、我慢していることがある。\n客観的データを優先する。',
    },
    background: '/assets/nurse_station.png',
    character: '/assets/senior_nurse_strict.png',
    characterAfterCorrect: '/assets/senior_nurse_normal.png',
  },
  {
    id: 'q3',
    scene: '医師報告前に整理する情報',
    question:
      '先輩から「医師に報告するから、情報を整理して」と言われた。\n医師へ報告する前に、最も優先して整理すべき情報はどれ？',
    choices: [
      {
        id: 'A',
        text: '患者の性格、妻の面会頻度、子どもが来ないこと。',
        isCorrect: false,
      },
      {
        id: 'B',
        text: 'SpO2、RR、HR、意識状態、呼吸音、会話可能か、痰の性状。',
        isCorrect: true,
      },
      {
        id: 'C',
        text: '食事摂取量、睡眠時間、退院希望の有無。',
        isCorrect: false,
      },
    ],
    correctExplanation:
      '正解です。急性の呼吸困難では、SpO2・RR・HR・意識状態・呼吸音・会話可能性・痰の性状が最優先の情報です。これらが医師の判断に直結します。',
    wrongExplanations: {
      A: '家族背景や性格は完全に不要ではないが、急性の呼吸困難で最初に整理する情報ではない。\n今の主問題に直結する呼吸状態の情報を優先する。',
      C: '食事や睡眠も看護情報としては大切。\nしかし今の主問題は呼吸困難。\n急性期では、主問題に直結する情報を優先する。',
    },
    background: '/assets/nurse_station.png',
    character: '/assets/senior_nurse_normal.png',
  },
  {
    id: 'q4',
    scene: 'SBAR — Situation',
    question:
      '医師へ電話報告を始める。まずSituation、つまり「今何が起きているか」を伝える。\nSituationとして最も適切なのはどれ？',
    choices: [
      {
        id: 'A',
        text: '田中さんは80代男性で、奥さんがよく面会に来ます。',
        isCorrect: false,
      },
      {
        id: 'B',
        text: '503号室の田中さんが、呼吸困難を訴えており、SpO2 85%、RR 30です。',
        isCorrect: true,
      },
      {
        id: 'C',
        text: '田中さんが少し頑固で、酸素を嫌がっています。',
        isCorrect: false,
      },
    ],
    correctExplanation:
      '正解です。SituationはSBARの最初のS。「誰の・今何が起きているか」を一文で明確に伝えます。患者の特定（号室・氏名）＋現在の症状＋数値で、緊急度が即座に伝わります。',
    wrongExplanations: {
      A: 'これはBackgroundに近い情報。\nSituationでは、今起きている問題を一文で伝える必要がある。',
      C: '患者が酸素を嫌がっていることは補足情報としては使える。\nしかし最初に伝えるべきなのは、呼吸困難、SpO2 85%、RR 30という現在の危険度。',
    },
    background: '/assets/nurse_station.png',
    character: '/assets/doctor_phone.png',
  },
  {
    id: 'q5',
    scene: 'SBAR — Background',
    question:
      '医師への電話報告を続ける。次はBackground（背景・経過）を伝える番だ。\nBackgroundとして最も適切なのはどれ？',
    choices: [
      {
        id: 'A',
        text: '田中さんは80代男性、COPD急性増悪疑いで入院中。昨夜から呼吸数増加傾向があり、本日は体温37.8℃、HR 116、RR 30、SpO2 85%（ルームエアー／RA）、wheeze聴取しています。',
        isCorrect: true,
      },
      {
        id: 'B',
        text: '田中さんは昨日夕食を半量しか食べられていません。睡眠は良好で、夜間の訴えもありませんでした。',
        isCorrect: false,
      },
      {
        id: 'C',
        text: '田中さんはCOPDで入院しています。もともと呼吸が少し悪い方です。今日も特に変わりなく経過していました。',
        isCorrect: false,
      },
    ],
    correctExplanation:
      '正解です。BackgroundはSBARの「B」。患者の背景と現在に至る経過を客観的に伝えます。年齢・診断名・経過（昨夜からの悪化傾向）・現在のバイタル数値をセットで伝えることで、医師が状況の重大性を正確に把握できます。',
    wrongExplanations: {
      B: '食事摂取量や睡眠状況は看護記録として重要ですが、急性呼吸困難の電話報告では優先情報ではありません。\nBackgroundには診断・入院経緯・バイタルの推移など、現在の問題に直結する臨床情報を含めます。',
      C: '「特に変わりなく経過」という報告は客観的データと矛盾しています。\nHR 116、RR 30、SpO2 85%という数値がある以上、「変わりない」とは言えません。\n思い込みや曖昧な表現ではなく、数値で現状を正確に伝えることが重要です。',
    },
    background: '/assets/nurse_station.png',
    character: '/assets/doctor_phone.png',
  },
  {
    id: 'q6',
    scene: 'SBAR — Assessment',
    question:
      'S・Bまで伝えた。次はAssessment（評価・判断）を伝える番だ。\nAssessmentとして最も適切なのはどれ？',
    choices: [
      {
        id: 'A',
        text: '所見からCOPD急性増悪が進行していると考えます。SpO2 85%・RR 30・wheeze・短文会話という組み合わせから、早急な対応が必要と判断しました。',
        isCorrect: true,
      },
      {
        id: 'B',
        text: 'COPDの患者さんなのでSpO2 85%はいつものことかもしれません。念のためのご報告ですので、お手すきの際にご確認いただければと思います。',
        isCorrect: false,
      },
      {
        id: 'C',
        text: '何が起きているかは先生に判断していただきたいです。私には評価は難しいです。',
        isCorrect: false,
      },
    ],
    correctExplanation:
      '正解です。AssessmentはSBARの「A」。観察したデータをもとに「自分はこう判断した」を伝えます。新人でも根拠つきで見立てを述べることが重要です。これにより医師が優先度を即座に判断できます。',
    wrongExplanations: {
      B: '「COPDだから85%はいつものこと」は根拠のない判断です。\nRR 30、短文会話、wheezeが加わっている時点で急性悪化のサインです。\n「念のためのご報告」という表現は緊急度を著しく下げてしまいます。',
      C: '最終的な治療判断は医師が行いますが、看護師がAssessmentを伝えないと医師も状況の緊急度を判断しにくくなります。\n観察したデータをもとに自分の見立てを伝えることが、SBAR報告の「A」の役割です。',
    },
    background: '/assets/nurse_station.png',
    character: '/assets/doctor_phone.png',
  },
  {
    id: 'q7',
    scene: 'SBAR — Recommendation',
    question:
      '医師にS・B・Aまで伝えた。最後にRecommendationを伝える必要がある。\nRecommendationとして最も適切なのはどれ？',
    choices: [
      {
        id: 'A',
        text: 'どうしたらいいですか？',
        isCorrect: false,
      },
      {
        id: 'B',
        text: '診察と、酸素投与・吸入・ABGなどの必要性について指示をお願いします。',
        isCorrect: true,
      },
      {
        id: 'C',
        text: 'とりあえず高流量酸素を開始しておきます。',
        isCorrect: false,
      },
    ],
    correctExplanation:
      '正解です。Recommendationでは「何を判断してほしいか」を具体的に伝えます。診察・酸素・吸入・ABGと具体的な選択肢を提示することで、医師が迅速に指示を出せます。',
    wrongExplanations: {
      A: '新人として自然な言い方だが、Recommendationとしては曖昧。\n医師に何を判断してほしいのかを具体的に伝える。',
      C: '低酸素は放置できない。\nしかしCOPDではCO2貯留リスクがあるため、無計画な高流量酸素は危険。\n酸素は避けるのではなく、目標SpO2と指示に沿って調整する。',
    },
    background: '/assets/nurse_station.png',
    character: '/assets/doctor_phone.png',
  },
  {
    id: 'q6',
    scene: 'COPDの病態',
    question:
      `同期${colleagueWord(gender)}が小声で聞いてくる。\n「COPDって、結局どこが問題なんだっけ？ 肺に空気が入らないってこと？」\nCOPDの病態として最も適切なのはどれ？`,
    choices: [
      {
        id: 'A',
        text: '気道狭窄や肺胞破壊により、特に息を吐き出しにくくなり、空気が肺に残りやすくなる。',
        isCorrect: true,
      },
      {
        id: 'B',
        text: '胃酸が逆流して気管を刺激し、急に呼吸が止まる病気である。',
        isCorrect: false,
      },
      {
        id: 'C',
        text: '心臓のポンプ機能が急に低下し、肺に水がたまる病気である。',
        isCorrect: false,
      },
    ],
    correctExplanation:
      '正解です。COPDでは気道狭窄と肺胞破壊により「息を吐き出しにくい」状態になります。空気が肺に閉じ込められる（過膨張）ことが特徴です。「入りにくい」ではなく「出にくい」がポイント。',
    wrongExplanations: {
      B: 'それは逆流や誤嚥の説明に近い。\nCOPDの中心は、気道狭窄、肺胞破壊、息を吐き出しにくいこと。',
      C: 'これは心不全の説明に近い。\nCOPDでは、肺に水がたまることよりも、空気を吐き出しにくくなり肺に残ることが重要。',
    },
    background: '/assets/hallway.png',
    character: colleagueImg(gender),
  },
  {
    id: 'q7',
    scene: 'wheezeの意味',
    question:
      '田中さんの胸に聴診器を当てると、ヒューヒューという音が聞こえる。\nこのwheezeが示している可能性として最も適切なのはどれ？',
    choices: [
      {
        id: 'A',
        text: '気道が狭くなり、空気が通る時に音が出ている。',
        isCorrect: true,
      },
      {
        id: 'B',
        text: '肺胞に水分がたまり、ブツブツした音が出ている。',
        isCorrect: false,
      },
      {
        id: 'C',
        text: '胸膜がこすれて、ザラザラした音が出ている。',
        isCorrect: false,
      },
    ],
    correctExplanation:
      '正解です。wheezeは気道狭窄による連続性の高い音（ヒューヒュー）です。COPDや喘息で聴取されます。気道が狭いほど音が高くなります。',
    wrongExplanations: {
      B: 'これはcracklesの説明に近い。\nwheezeは、狭くなった気道を空気が通ることで聞こえる連続性の高い音。',
      C: 'これは胸膜摩擦音に近い。\n今回のヒューヒュー音は、気道狭窄を疑う所見。',
    },
    background: '/assets/patient_room.png',
    character: null,
  },
  {
    id: 'q8',
    scene: 'SpO2 85%への判断',
    question:
      '田中さんのSpO2は85% ルームエアー（RA）。RR 30、短文会話、wheezeあり。\n田中さんは「酸素なんかいらない。大丈夫」と言っている。\nこの時の判断として最も適切なのはどれ？',
    choices: [
      {
        id: 'A',
        text: 'COPDではSpO2 85%は常に正常なので、何もしない。',
        isCorrect: false,
      },
      {
        id: 'B',
        text: '呼吸状態悪化の可能性があるため、先輩に報告し、指示・プロトコルに沿って酸素投与や医師報告を検討する。',
        isCorrect: true,
      },
      {
        id: 'C',
        text: 'SpO2をすぐ100%に近づけるため、高流量酸素を最大量で開始する。',
        isCorrect: false,
      },
    ],
    correctExplanation:
      '正解です。COPDではSpO2目標を88〜92%程度に設定することが多く、今回の85%はその目標を下回っています。さらにRR 30・短文会話・wheezeを総合すると、呼吸状態の悪化と判断できます。指示なく勝手に動かず、先輩・医師に報告して指示を仰ぐことが重要です。',
    wrongExplanations: {
      A: '「COPDだからSpO2 85%なら常に正常」と決めつけるのは危険。\nRR 30、短文会話、wheezeがあるため、呼吸状態悪化を疑う。',
      C: '低酸素には対応が必要。\nしかしCOPDではCO2貯留リスクも考える。\n最大量で酸素を入れるのではなく、目標SpO2と指示を確認する。',
    },
    background: '/assets/patient_room.png',
    character: null,
  },
  {
    id: 'q9',
    scene: 'CO2貯留で注意する変化',
    question:
      '先輩から言われた。\n「COPDだから、酸素だけじゃなくてCO2貯留にも注意して。何を見る？」\nCO2貯留が悪化している可能性を考える時、特に注意すべき変化はどれ？',
    choices: [
      {
        id: 'A',
        text: '意識レベルの低下、眠気、混乱が出ていないか。',
        isCorrect: true,
      },
      {
        id: 'B',
        text: 'SpO2の値がさらに低下していないか定期的に確認する。',
        isCorrect: false,
      },
      {
        id: 'C',
        text: '呼吸回数がさらに上昇していないか観察する。',
        isCorrect: false,
      },
    ],
    correctExplanation:
      '正解です。CO2貯留（高炭酸ガス血症）では、眠気・混乱・意識レベルの低下・頭痛・手の振戦（asterixis）などが出現します。CO2は中枢神経を抑制するため、SpO2だけでなく意識状態の変化を観察することが重要です。',
    wrongExplanations: {
      B: 'SpO2は酸素化（低酸素血症）の指標であり、CO2貯留の直接評価には使えない。\nCOPDでCO2が貯留しても、SpO2が目標範囲に見えることがある。\nCO2貯留を疑うときは眠気・混乱・意識レベル低下など中枢神経症状を確認する。',
      C: '呼吸回数の観察は重要だが、CO2貯留が進行すると呼吸中枢が抑制され、かえって呼吸数が減少したり浅くなることがある。\n「返事が遅い」「眠気が強い」など意識変化のほうがCO2貯留のより特異的なサインになる。',
    },
    background: '/assets/nurse_station.png',
    character: '/assets/senior_nurse_normal.png',
  },
  {
    id: 'q10',
    scene: '最終判断',
    question:
      '10:00。田中さんは「大丈夫」と言っているが、会話は短文になっている。\n最新バイタルはHR 116、RR 30、SpO2 85% ルームエアー（RA）、意識清明、wheezeあり、黄色痰あり。\n新人看護師として、次に取る行動で最も適切なのはどれ？',
    choices: [
      {
        id: 'A',
        text: '先輩にすぐ報告し、呼吸状態悪化として医師報告の必要性を相談する。',
        isCorrect: true,
      },
      {
        id: 'B',
        text: '本人が大丈夫と言っているので、次の定時バイタルまで待つ。',
        isCorrect: false,
      },
      {
        id: 'C',
        text: '妻に「大丈夫です」と説明して、患者を休ませる。',
        isCorrect: false,
      },
    ],
    correctExplanation:
      '正解です。患者が「大丈夫」と言っていても、客観的データが悪化を示しているときは即座に行動します。新人は一人で判断せず、先輩に報告・相談することが患者安全の基本です。',
    wrongExplanations: {
      B: 'これは危険な判断。\nRR 30、SpO2 85%、短文会話、wheezeがあるため、定時バイタルまで待つべきではない。',
      C: '根拠なく家族に「大丈夫です」と断言してはいけない。\n「呼吸が少し苦しそうなので、今から確認します」と伝える方が安全。',
    },
    background: '/assets/patient_room.png',
    character: null,
  },
  ];
}
