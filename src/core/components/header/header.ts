import { content } from '../types';
import html from './header.html';
import './header.scss';

export class Header implements content {
  // constructor() {}

  async render() {
    return html;
  }

  async run() {
    this.runListeners();
  }

  runListeners() {
    document.querySelector('.btn_auth')?.addEventListener('click', () => {
      document.querySelector('.popup')?.classList.add('active');
    });
  }
}
