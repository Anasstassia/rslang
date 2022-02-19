import { isToday } from 'date-fns';
import { client } from '../../core/client';
// import { updateLearnedPagesStatistics } from '../../core/client/stat';
import { state, StatResponse } from '../../core/client/users';
import { content, iUserWord } from '../../core/components/types';
import html from './stats.html';
import './stats.scss';

export class Stats implements content {
  id?: string;

  learnedWords: number;

  learnedPages: {
    [key: number]: Array<number>;
  };

  optional?: StatResponse['optional'];

  constructor() {
    this.id = state.currentUser?.id;
    this.learnedWords = 0;
    this.learnedPages = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
  }

  async render() {
    console.log(state);
    return html;
  }

  async run() {
    this.getDate();
    this.setStatistics();
  }

  getDate() {
    const dateElement = document.querySelector<HTMLElement>('.stats__date');
    const date = new Date();
    const monthNumber = date.getMonth();
    const day = date.getDate();
    const months = [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мае',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря',
    ];
    const month = months[monthNumber];

    if (!dateElement) return;
    dateElement.innerHTML = `${day} ${month}`;
  }

  async setStatistics() {
    this.setGameStatistics('sprint');
    this.setGameStatistics('audio');
    this.setGeneralStatistics();
  }

  setGameStatistics = async (game: 'audio' | 'sprint') => {
    const stat = await client.get<unknown, { data: StatResponse }>(`/users/${this.id}/statistics`);
    const gameCard = document.querySelector(`.card_${game}`);
    const newWords = gameCard?.querySelector('.words_number');
    const percentCorrect = gameCard?.querySelector('.words_perc');
    const mostInRow = gameCard?.querySelector('.words_max');

    const mainPath = game === 'audio' ? stat.data.optional.audioGame : stat.data.optional.sprintGame;

    const countNewWords = `${mainPath?.newWords}`;
    const countTotalCorrect = mainPath?.totalCorrectWords;
    const gamesCount = mainPath?.gamesPlayed;
    const mostInRowCount = mainPath?.mostWordsInRow;

    // console.log(`countTotalCorrect ${countTotalCorrect}, gamesCount ${gamesCount}, mostInRowCount ${mostInRowCount}`);

    if (!percentCorrect || !mostInRow || !newWords || !countTotalCorrect || !gamesCount) return;
    newWords.innerHTML = `${countNewWords}`;
    percentCorrect.innerHTML = `${Math.round((countTotalCorrect * 100) / (20 * gamesCount))}%`;
    mostInRow.innerHTML = `${mostInRowCount}`;
  };

  setGeneralStatistics = async () => {
    const stat = await client.get<unknown, { data: StatResponse }>(`/users/${state.currentUser?.id}/statistics`);

    const totalLearnedWords = document.querySelector('.words_new');
    const totalPercentCorrect = document.querySelector('.total-percent');
    const totalNewWords = document.querySelector('.total_new');

    const countAudioNew = Number(stat.data.optional.audioGame?.newWords);
    const countSprintNew = Number(stat.data.optional.sprintGame?.newWords);

    const countTotalLearned = await this.getLearnedWordsPerDay();

    const rightAnswAudio = Number(stat.data.optional.audioGame?.totalCorrectWords);
    const rightAnswSprint = Number(stat.data.optional.sprintGame?.totalCorrectWords);
    const gamesPlayedAudio = Number(stat.data.optional.audioGame?.gamesPlayed);
    const gamesPlayedSprint = Number(stat.data.optional.sprintGame?.gamesPlayed);
    console.log({
      countTotalLearned,
      rightAnswAudio,
      rightAnswSprint,
      gamesPlayedAudio,
      gamesPlayedSprint,
      countAudioNew,
    });

    const countTotalPercent = Math.round(
      ((rightAnswAudio + rightAnswSprint) * 100) / (gamesPlayedAudio * 20 + gamesPlayedSprint * 20)
    );

    const countTotalNew = countAudioNew + countSprintNew;
    if (!totalLearnedWords) return;
    totalLearnedWords.innerHTML = `${countTotalLearned}`;

    if (!totalPercentCorrect) return;
    totalPercentCorrect.innerHTML = `${countTotalPercent}%`;

    if (!totalNewWords) return;
    totalNewWords.innerHTML = `${countTotalNew}`;
  };

  // get = async () => {
  //   const response = await client.get(`/users/${state.currentUser?.id}/statistics`);
  //   const stat = response.data;
  //   this.learnedWords = stat.learnedWords;
  //   this.learnedPages = stat.optional.learnedPages;
  //   this.optional = stat.optional;
  //   return response.data;
  // };

  // send = async () => {
  //   const arg = {
  //     learnedWords: this.learnedWords,
  //     optional: {
  //       ...this.optional,
  //       learnedPages: this.learnedPages,
  //     },
  //   };
  //   await client.put(`/users/${this.id}/statistics`, arg);
  //   // updateLearnedPagesStatistics(this.learnedPages);
  // };

  // update = async () => {
  //   await this.send();
  //   await this.get();
  // };

  getLearnedWordsPerDay = async () => {
    const response = await client.get(
      `/users/${state.currentUser?.id}/aggregatedWords?wordsPerPage=200&filter={"userWord.optional.done":true}`
    );
    let data = response.data[0].paginatedResults;
    data = data.filter((word: iUserWord) => {
      if (word.userWord) {
        if (isToday(new Date(word.userWord?.optional.date))) {
          return word;
        }
      }
      return undefined;
    });
    return data.length;
  };
}
