import { content } from '../../../core/components/types';
import { changeContent } from '../animation';
import { checkLocalStarage, toggleHeaderBtns } from '../utils';
import html from './audioCall.html';
import './audioCall.scss';

export class AudioCall implements content {
  async render() {
    return html;
  }

  async run() {
    checkLocalStarage();
    toggleHeaderBtns(localStorage.getItem('sound') !== 'false');
    this.addListeners();
  }

  addListeners() {
    document.getElementById('startAudioCallGameBtn')?.addEventListener('click', () => {
      this.startGame();
    });
    const startGame = (ev: KeyboardEvent) => {
      if (ev.code === 'Enter') {
        this.startGame();
        document.removeEventListener('keydown', startGame);
      }
    };
    document.addEventListener('keydown', startGame);
  }

  startGame() {
    this.generateContentUI();
  }

  generateContentUI() {
    const wrap = document.querySelector('.audio-call__content') as HTMLElement;
    changeContent(wrap, 3000, 600, 300, 600, 300, 20, [0.05, 0.5, 0.7, 0.9]);
  }
}
