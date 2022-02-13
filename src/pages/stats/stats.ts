import { state } from '../../core/client/users';
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
    this.checkUser();
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

  checkUser() {
    const statsContainer = document.querySelector('.stats__cards');
    const message = document.createElement('p');

    if (!state.currentUser && statsContainer) {
      message.innerHTML = 'Только авторизированные пользователи могут просматривать статистику';
      message.classList.add('notification');
      statsContainer.prepend(message);
    } else {
      message.remove();
    }
  }

  setStatistics() {
    const todayDate = new Date();
    const currentDay = todayDate.getDate();

    const setGameStatistics = (game: 'audio' | 'sprint') => {
      const gameCard = document.querySelector(`.card_${game}`);
      const gamesCount = sprintStatistics.gamesPlayed;
      const newWords = gameCard?.querySelector('.words_number');
      const percentCorrect = gameCard?.querySelector('.words_perc');
      const mostInRow = gameCard?.querySelector('.words_max');

      if (!percentCorrect || !mostInRow || !newWords) return;
      if (currentDay === sprintStatistics.currentDay) {
        newWords.innerHTML = ``;
        percentCorrect.innerHTML = `${Math.round((sprintStatistics.totalCorrectWords * 100) / (20 * gamesCount))}%`;
        mostInRow.innerHTML = `${sprintStatistics.mostWordsInRow}`;
      } else {
        // newWords?.innerHTML = ``;
        percentCorrect.innerHTML = `0%`;
        mostInRow.innerHTML = `0`;
      }
    };

    const setGeneralStatistics = () => {
      const totalLearnedWords = document.querySelector('.learned-count');
      const totalPercentCorrect = document.querySelector('.total-percent');
      const totalNewWords = document.querySelector('.total_new');

      if (!totalLearnedWords || !totalPercentCorrect || !totalNewWords) return;
      totalLearnedWords.innerHTML = '0';
      totalPercentCorrect.innerHTML = '0';
      totalNewWords.innerHTML = '0';
    };

    setGameStatistics('sprint');
    // setGameStatistics('audio');
    setGeneralStatistics();
  }
}
