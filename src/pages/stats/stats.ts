import { client } from '../../core/client';
import { state, StatResponse } from '../../core/client/users';
import { content } from '../../core/components/types';
import { sprintStatistics } from '../games/statistics';
import html from './stats.html';
import './stats.scss';

export class Stats implements content {
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
    const stat = await client.get<unknown, { data: StatResponse }>(`/users/${state.currentUser?.id}/statistics`);

    const totalLearnedWords = document.querySelector('.words_new');
    const totalPercentCorrect = document.querySelector('.total-percent');
    const totalNewWords = document.querySelector('.total_new');

    const countTotalLearned = stat.data.learnedWords;
    const countTotalPercent = 0; // TODO
    const countTotalNew = 0; // TODO

    if (!totalLearnedWords || !totalPercentCorrect || !totalNewWords) return;

    totalLearnedWords.innerHTML = `${countTotalLearned}`;
    totalPercentCorrect.innerHTML = `${countTotalPercent}%`;
    totalNewWords.innerHTML = `${countTotalNew}`;
  };
}
