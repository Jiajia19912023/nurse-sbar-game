export type Screen = 'title' | 'select' | 'name' | 'intro' | 'game' | 'gameover' | 'clear';
export type Gender = 'female' | 'male';

export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  scene: string;
  question: string;
  choices: Choice[];
  correctExplanation: string;
  wrongExplanations: Record<string, string>;
  background: string;
  character: string | null;
  characterAfterCorrect?: string | null;
}

export interface Feedback {
  type: 'correct' | 'wrong';
  text: string;
  wrongChoiceId?: string;
}

export interface IntroScene {
  background: string;
  character: string | null;
  text: string;
}
