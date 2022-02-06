/* eslint-disable no-param-reassign */
import { content, iWord } from '../../../core/components/types';
import html from './sprint.html';
import './sprint.scss';

type Word = {
  word: string;
  wordTranslate: string;
};

export class SprintGame implements content {
  isSoundOn = true;

  timeLeft = 60;

  isGameOver = false;

  words: Array<Word> = [];

  async render() {
    return html;
  }

  async run() {
    this.addListeners();
  }

  addListeners() {
    const path = '../../../assets/icons';

    // toggle sound
    const soundBtn = document.getElementById('sprintSound') as HTMLImageElement;
    soundBtn.addEventListener('click', () => {
      this.isSoundOn = !this.isSoundOn;
      soundBtn.src = this.isSoundOn ? `${path}/soundOn.svg` : `${path}/soundOff.svg`;
    });

    // toggle fullscreen
    const fullscreenBtn = document.getElementById('sprintFullscreen') as HTMLImageElement;
    fullscreenBtn.addEventListener('click', () => {
      const sprintContent = document.querySelector('.sprint__content') as HTMLElement;

      if (!document.fullscreenElement) {
        document.querySelector('.sprint')?.requestFullscreen();
        sprintContent.style.marginTop = '20vh';
        fullscreenBtn.src = `${path}/fullscreenOff.svg`;
      } else {
        document.exitFullscreen();
        fullscreenBtn.src = `${path}/fullscreenOn.svg`;
        sprintContent.style.marginTop = '';
      }
    });

    document.getElementById('startSprintGameBtn')?.addEventListener('click', () => {
      this.startGame();
    });
  }

  startGame() {
    this.generateWords();

    const { time, line } = this.generateTimerUI();
    /* const { word, translatedWord wrongBtn, correctBtn, mark } = */ this.generateContentUI();

    this.startTimer(time, line);
  }

  startTimer(time: HTMLElement, line: HTMLElement) {
    setTimeout(() => {
      let width = line.clientWidth;
      line.style.width = `${width}px`;

      const interval = setInterval(() => {
        this.timeLeft -= 1;
        time.innerHTML = this.timeLeft.toString();

        width -= 10;
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
          this.gameOver();
          clearInterval(interval);

          this.timeLeft = 60;
          time.style.color = '';
          line.style.backgroundColor = '';
        }
      }, 1000);
    }, 3000);
  }

  gameOver() {
    console.log('Game over!');
  }

  generateWords() {
    const group = document.querySelector<HTMLSelectElement>('.diff')?.value;

    this.getWords(group).then((el) => {
      el.forEach((element: iWord) => {
        const { word, wordTranslate } = element;
        this.words.push({ word, wordTranslate });
      });
    });
  }

  async getWords(group: string | undefined) {
    const randPage = Math.round(Math.random() * 30);

    const response = await (
      await fetch(`https://rs-lang-irina-mokh.herokuapp.com/words?group=${group}&page=${randPage}`)
    ).json();
    return response;
  }

  generateContentUI() {
    const word = document.createElement('h2');
    word.classList.add('sprint__content__word');

    word.innerHTML = 'Test'; // TODO: Remove

    const translatedWord = document.createElement('p');
    translatedWord.classList.add('sprint__content__translate');

    translatedWord.innerText = 'Тест'; // TODO: Remove

    const btnsWrap = document.createElement('div');
    btnsWrap.classList.add('answer-btns');

    const wrongBtn = document.createElement('button');
    wrongBtn.classList.add('answer-btns__wrong');
    wrongBtn.innerHTML = 'Не верно';

    const correctBtn = document.createElement('button');
    correctBtn.classList.add('answer-btns__correct');
    correctBtn.innerHTML = 'Верно';

    const mark = document.createElement('img');
    mark.classList.add('answer-btns__mark', 'hide');
    mark.alt = 'mark';

    btnsWrap.append(wrongBtn, mark, correctBtn);

    const wrap = document.querySelector('.sprint__content') as HTMLElement;

    this.animate(wrap, 'changeContent', '3s', 'ease-in-out');
    this.animate(word, 'appearanceContent', '3.2s', 'ease-in-out');
    this.animate(translatedWord, 'appearanceContent', '3.2s', 'ease-in-out');
    this.animate(btnsWrap, 'appearanceContent', '3.2s', 'ease-in-out');

    wrap.innerHTML = '';
    wrap.append(word, translatedWord, btnsWrap);

    return { word, translatedWord, wrongBtn, correctBtn, mark };
  }

  generateTimerUI() {
    const timerWrap = document.createElement('div');
    timerWrap.classList.add('timer');

    const time = document.createElement('span');
    time.innerHTML = this.timeLeft.toString();

    const line = document.createElement('div');
    line.classList.add('line');

    timerWrap.append(time, line);

    const wrap = document.querySelector('.sprint .container') as HTMLElement;

    this.animate(timerWrap, 'timerAppearance', '3s', 'ease-in-out');

    wrap.appendChild(timerWrap);

    return { time, line };
  }

  animate(element: HTMLElement, name: string, time: string, animationFunc: string) {
    element.style.animationName = `${name}`;
    element.style.animationDuration = `${time}`;
    element.style.animationTimingFunction = `${animationFunc}`;
    element.style.animationFillMode = 'forwards';
  }
}
