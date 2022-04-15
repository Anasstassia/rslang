import { content } from '../../core/components/types';
import html from './main.html';
import './main.scss';

export class Main implements content {
  async render() {
    return html;
  }

  async run() {
    const vocabLink = document.querySelector('.menu__link') as HTMLElement;
    vocabLink.addEventListener('click', () => {
      localStorage.setItem('page', '0');
      localStorage.setItem('group', '0');
      localStorage.setItem('request', 'basic');
    });
    return undefined;
  }
}
