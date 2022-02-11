// per day!
interface statistics {
  gamesPlayed: number;
  totalCorrectWords: number;
  mostWordsInRow: number;
}

export const sprintStatistics: statistics = {
  gamesPlayed: 0,
  totalCorrectWords: 0,
  mostWordsInRow: 0,
};

const storageItem = localStorage.getItem('sprintStatistics');
if (storageItem) {
  const stat: statistics = JSON.parse(storageItem);

  sprintStatistics.gamesPlayed = stat.gamesPlayed;
  sprintStatistics.totalCorrectWords = stat.totalCorrectWords;
  sprintStatistics.mostWordsInRow = stat.mostWordsInRow;
}
