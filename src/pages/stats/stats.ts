import { isToday } from 'date-fns';
import { client } from '../../core/client';
import { state, StatResponse } from '../../core/client/users';
import { content, iUserWord, userWord } from '../../core/components/types';
import { sprintStatistics } from '../games/statistics';
import html from './stats.html';
import './stats.scss';

export class Stats implements content {
  id?: string;

  learnedWords: number;

  learnedPages: {
    [key: number]: Array<number>;
  };

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
    // this.setGameStatistics('audio'); TODO
    this.setGeneralStatistics();
  }

  setGameStatistics = async (game: 'audio' | 'sprint') => {
    const stat = await client.get<unknown, { data: StatResponse }>(`/users/${state.currentUser?.id}/statistics`);
    const gameCard = document.querySelector(`.card_${game}`);
    const newWords = gameCard?.querySelector('.words_number');
    const percentCorrect = gameCard?.querySelector('.words_perc');
    const mostInRow = gameCard?.querySelector('.words_max');

    const countNewWords = stat.data.optional.sprintGame?.newWords;
    const countTotalCorrect = stat.data.optional.sprintGame?.totalCorrectWords;
    const gamesCount = stat.data.optional.sprintGame?.gamesPlayed;

    if (!percentCorrect || !mostInRow || !newWords || !countTotalCorrect || !gamesCount) return;

    newWords.innerHTML = `${countNewWords}`;
    percentCorrect.innerHTML = `${Math.round((countTotalCorrect * 100) / (20 * gamesCount))}%`;
    mostInRow.innerHTML = `${sprintStatistics.mostWordsInRow}`;
  };

  setGeneralStatistics = async () => {
    // const stat = await client.get<unknown, { data: StatResponse }>(`/users/${state.currentUser?.id}/statistics`);

    const totalLearnedWords = document.querySelector('.words_new');
    const totalPercentCorrect = document.querySelector('.total-percent');
    const totalNewWords = document.querySelector('.total_new');

    const countTotalLearned = await this.getLearnedWordsPerDay();
    const countTotalPercent = 0; // TODO
    const countTotalNew = 0; // TODO

    if (!totalLearnedWords || !totalPercentCorrect || !totalNewWords) return;

    totalLearnedWords.innerHTML = `${countTotalLearned}`;
    totalPercentCorrect.innerHTML = `${countTotalPercent}%`;
    totalNewWords.innerHTML = `${countTotalNew}`;
  };

  get = async () => {
    const response = await client.get(`/users/${this.id}/statistics`);
    const stat = response.data;
    this.learnedWords = stat.learnedWords;
    this.learnedPages = stat.optional.learnedPages;
    return response.data;
  };

  send = async () => {
    const arg = {
      learnedWords: this.learnedWords,
      optional: {
        learnedPages: this.learnedPages,
      },
    };
    await client.put(`/users/${this.id}/statistics`, arg);
  };

  update = async () => {
    await this.send();
    await this.get();
  };

  // предлагаю принять learnedWords - изученные за ВСЕ время(может понадобиться в долгосрочной)
  // а для получения в статисике на сегодня фильтровать юзерские слова
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
