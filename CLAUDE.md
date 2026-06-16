# 新人ナースの判断記録 — CLAUDE.md

## プロジェクト概要
新人看護師向け学習シミュレーションゲーム（第1章のみ）。
ブラウザ動作、React + Vite + TypeScript + Tailwind CSS。
スマホ優先・PCも対応のレスポンシブデザイン。

## 技術スタック
- React 19 + TypeScript
- Vite
- Tailwind CSS
- 状態管理: useState のみ（外部ライブラリ不使用）

## ファイル構成
```
src/
  App.tsx              # メインゲームロジック・全state管理
  data/questions.ts    # Q1〜Q10 問題データ
  types/index.ts       # 型定義
  index.css            # Tailwind import
  main.tsx
public/
  assets/              # 全ゲーム画像（12枚）
    entrance.png
    hallway.png
    nurse_station.png
    patient_room.png
    doctor_normal.png
    doctor_phone.png
    senior_nurse_strict.png
    senior_nurse_normal.png
    male_nurse_normal.png
    male_nurse_sad.png
    female_nurse_normal.png
    female_nurse_sad.png
```

## 必須 state（App.tsx）
- currentScreen: 'main' | 'select' | 'intro' | 'game' | 'gameover' | 'clear'
- selectedPlayerGender: 'female' | 'male' | null
- currentQuestionIndex: number (0〜9)
- mentalGauge: number (0〜100)
- showChartModal: boolean
- showVitalsModal: boolean
- currentFeedback: { type: 'correct'|'wrong'; text: string; wrongChoice?: string } | null
- isRetrying: boolean （不正解後に同問題を再表示するフラグ）

## ゲームフロー
1. main → START → select（性別選択）
2. select → intro（場面1〜4のナレーション）
3. intro → game（Q1〜Q10）
4. 各問題: 正解→解説→次へ / 不正解→解説→メンタル-10→0以下ならgameover→1以上なら同問再挑戦
5. Q10正解 → clear
6. gameover / clear → メイン画面（メンタル100リセット）

## やってはいけないこと
- 第2章以降の実装
- Gemini/外部AI API の呼び出し（既存コードにあるが削除）
- 音声認識（既存コードにあるが削除）
- 正解時にメンタルを増減させる
- 患者安全に関わる誤答の解説を曖昧にする
