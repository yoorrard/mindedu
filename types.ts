export interface Emotion {
  id: string;
  text: string;
  emoji: string;
}

export interface Response {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface Scenario {
  scenario: string;
  emotions: Emotion[];
  responses: Response[];
}

export enum GameState {
  LOADING,
  WELCOME,
  PLAYING,
  FEEDBACK,
  GENERATING_REPORT,
  FINISHED,
}

export interface UserAnswer {
  scenario: string;
  selectedEmotionTexts: string[];
  selectedResponseText: string;
  writtenResponse: string;
}
