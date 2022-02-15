import { content } from '../../../core/components/types';
import { appearanceContent, changeContent, show } from '../animation';
import { checkLocalStarage, toggleHeaderBtns } from '../utils';
import html from './audioCall.html';
import '../game.scss';
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
    /* const heartWrap = */ this.generateHeartsUI();
  }

  generateHeartsUI() {
    const heartWrap = document.createElement('div');
    heartWrap.classList.add('hearts');

    for (let i = 1; i < 6; i += 1) {
      const heart = document.createElement('div');
      heart.classList.add('hearts__item');
      heart.id = i.toString();

      heartWrap.appendChild(heart);
    }

    const wrap = document.querySelector('.audio-call .container') as HTMLElement;

    show(heartWrap, 3000, 300, 0.7);

    wrap.appendChild(heartWrap);

    return heartWrap;
  }

  generateContentUI() {
    const wrap = document.querySelector('.audio-call__content') as HTMLElement;

    const audioIcon = document.createElement('img');
    audioIcon.classList.add('audio-icon');
    audioIcon.src = '../../../assets/icons/volume.svg';
    audioIcon.alt = 'Sound';

    const btnsWrap = document.createElement('div');
    btnsWrap.classList.add('audio-call__content__answer-btns');

    const btn1 = document.createElement('button');
    const btn2 = document.createElement('button');
    const btn3 = document.createElement('button');
    const btn4 = document.createElement('button');

    btnsWrap.append(btn1, btn2, btn3, btn4);

    changeContent(wrap, 3000, 600, 300, 750, 300, 20, [0.05, 0.5, 0.7, 0.9]);
    appearanceContent(audioIcon, 3200);
    appearanceContent(btnsWrap, 3200);

    wrap.innerHTML = '';
    wrap.append(audioIcon, btnsWrap);

    return { audioIcon, btns: { btnsWrap, btn1, btn2, btn3, btn4 } };
  }
}
