import { content } from '../../../core/components/types';
import { changeContent, show } from '../animation';
import { checkLocalStarage, toggleHeaderBtns } from '../utils';
import html from './audioCall.html';
import './audioCall.scss';

export class AudioCall implements content {
  timeLeft = 10;

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
    const { time, line } = this.generateTimerUI();
    this.generateContentUI();

    this.startTimer(time, line, 3000);
  }

  generateTimerUI() {
    const timerWrap = document.createElement('div');
    timerWrap.classList.add('timer');

    const time = document.createElement('span');
    time.innerHTML = this.timeLeft.toString();

    const line = document.createElement('div');
    line.classList.add('line');

    timerWrap.append(time, line);

    const wrap = document.querySelector('.audio-call .container') as HTMLElement;

    show(timerWrap, 3000, 300, 0.7);

    wrap.appendChild(timerWrap);

    return { time, line };
  }

  startTimer(time: HTMLElement, line: HTMLElement, delay: number) {
    setTimeout(() => {
      let width = line.clientWidth;
      line.style.width = `${width}px`;

      const interval = setInterval(() => {
        this.timeLeft -= 1;
        time.innerHTML = this.timeLeft.toString();

        width -= 30;
        line.style.width = `${width}px`;

        if (this.timeLeft === 5) {
          time.style.color = '#ffe600';
          line.style.backgroundColor = '#ffe600';
        }

        if (this.timeLeft === 3) {
          time.style.color = '#bd0404';
          line.style.backgroundColor = '#bd0404';
        }

        if (this.timeLeft === 0) {
          console.log('Next word');

          clearInterval(interval);

          this.timeLeft = 10;
          time.style.color = '';
          line.style.backgroundColor = '';
        }
      }, 1000);
    }, delay);
  }

  generateContentUI() {
    const wrap = document.querySelector('.audio-call__content') as HTMLElement;
    changeContent(wrap, 3000, 600, 300, 600, 300, 20, [0.05, 0.5, 0.7, 0.9]);
  }
}
