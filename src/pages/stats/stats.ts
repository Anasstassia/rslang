import { state } from '../../core/client/users';
import { content } from '../../core/components/types';
import html from './stats.html';
import './stats.scss';

export class Stats implements content {
  async render() {
    return html;
  }

  async run() {
    this.getDate();
    this.checkUser();
  }

  getDate() {
    const dateElement = document.querySelector<HTMLElement>('.stats__date');
    const date = new Date();
    const monthNumber = date.getMonth();
    const day = date.getDate();
    let month = '';

    switch (monthNumber) {
      case 0:
        month = 'января';
        break;
      case 1:
        month = 'февраля';
        break;
      case 2:
        month = 'марта';
        break;
      case 3:
        month = 'апреля';
        break;
      case 4:
        month = 'мае';
        break;
      case 5:
        month = 'июня';
        break;
      case 6:
        month = 'июля';
        break;
      case 7:
        month = 'августа';
        break;
      case 8:
        month = 'сентября';
        break;
      case 9:
        month = 'октября';
        break;
      case 10:
        month = 'ноября';
        break;
      case 11:
        month = 'декабря';
        break;
      default:
        return;
    }
    if (!dateElement) return;
    dateElement.innerHTML = `${day} ${month}`;
  }

  checkUser() {
    const statsContainer = document.querySelector('.stats__cards');

    if (!state.currentUser && statsContainer) {
      const message = document.createElement('p');
      message.innerHTML = 'Только авторизированные пользователи могут просматривать статистику';
      message.classList.add('notification');
      statsContainer.prepend(message);
    }
  }
}
