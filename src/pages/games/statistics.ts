// per day!
interface statistics {
  gamesPlayed: number;
  totalCorrectWords: number;
  mostWordsInRow: number;
  newWords: number;
}

export const sprintStatistics: statistics = {
  gamesPlayed: 0,
  totalCorrectWords: 0,
  mostWordsInRow: 0,
  newWords: 0,
};

export const audioStatistics: statistics = {
  gamesPlayed: 0,
  totalCorrectWords: 0,
  mostWordsInRow: 0,
  newWords: 0,
};

export const audioCallStatistics: statistics = {
  gamesPlayed: 0,
  totalCorrectWords: 0,
  mostWordsInRow: 0,
  newWords: 0,
};
