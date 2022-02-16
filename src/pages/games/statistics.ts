// per day!
interface statistics {
  gamesPlayed: number;
  totalCorrectWords: number;
  mostWordsInRow: number;
  currentDay?: number;
}

export const sprintStatistics: statistics = {
  gamesPlayed: 0,
  totalCorrectWords: 0,
  mostWordsInRow: 0,
};

const storageSprintItem = localStorage.getItem('sprintStatistics');
if (storageSprintItem) {
  const stat: statistics = JSON.parse(storageSprintItem);

  sprintStatistics.gamesPlayed = stat.gamesPlayed;
  sprintStatistics.totalCorrectWords = stat.totalCorrectWords;
  sprintStatistics.mostWordsInRow = stat.mostWordsInRow;
  sprintStatistics.currentDay = stat.currentDay;
}

export const audioCallStatistics: statistics = {
  gamesPlayed: 0,
  totalCorrectWords: 0,
  mostWordsInRow: 0,
};
const storageAudioCallItem = localStorage.getItem('audioCallStatistics');
if (storageAudioCallItem) {
  const stat: statistics = JSON.parse(storageAudioCallItem);

  audioCallStatistics.gamesPlayed = stat.gamesPlayed;
  audioCallStatistics.totalCorrectWords = stat.totalCorrectWords;
  audioCallStatistics.mostWordsInRow = stat.mostWordsInRow;
  audioCallStatistics.currentDay = stat.currentDay;
}
