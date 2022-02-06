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

  isCorrect = false;

  words: Array<Word> = [];

  wrongWords: Array<Word> = [];

  ids: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  currId = 0;

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
    const { time, line } = this.generateTimerUI();
    const { word, translatedWord, wrongBtn, correctBtn, mark } = this.generateContentUI();

    correctBtn.addEventListener('click', () => {
      if (this.isCorrect) {
        mark.src = '../../../assets/icons/tick.svg';
        mark.classList.remove('hidden');

        setTimeout(() => {
          mark.classList.add('hidden');
          this.renderContent(word, translatedWord);
        }, 700);
      } else {
        this.wrongWords.push(this.words[this.currId]);

        mark.src = '../../../assets/icons/cross.svg';
        mark.classList.remove('hidden');

        setTimeout(() => {
          mark.classList.add('hidden');
          this.renderContent(word, translatedWord);
        }, 700);
      }
    });

    wrongBtn.addEventListener('click', () => {
      if (!this.isCorrect) {
        mark.src = '../../../assets/icons/tick.svg';
        mark.classList.remove('hidden');

        setTimeout(() => {
          mark.classList.add('hidden');
          this.renderContent(word, translatedWord);
        }, 700);
      } else {
        this.wrongWords.push(this.words[this.currId]);

        mark.src = '../../../assets/icons/cross.svg';
        mark.classList.remove('hidden');

        setTimeout(() => {
          mark.classList.add('hidden');
          this.renderContent(word, translatedWord);
        }, 700);
      }
    });

    this.generateWords();

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

  renderContent(wordWrap: HTMLElement | null, translatedWordWrap: HTMLElement | null) {
    const id = this.chooseWord();
    if (id) {
      this.currId = id;
      if (wordWrap !== null && translatedWordWrap !== null) {
        wordWrap.innerHTML = this.words[id].word;

        translatedWordWrap.innerHTML =
          this.words[this.isCorrectTranslate() ? id : this.getRandomNum(0, 19)].wordTranslate;
      }
    } else {
      this.gameOver();
    }
  }

  chooseWord() {
    if (this.ids.length === 0) {
      return false;
    }
    const randNum = this.getRandomNum(0, this.ids.length - 1);
    const id = this.ids[randNum];
    this.ids.splice(randNum, 1);
    return id;
  }

  gameOver() {
    this.generateStatisticUI();
    console.log('Game over!');
    console.log(this.wrongWords);
  }

  generateWords() {
    const group = document.querySelector<HTMLSelectElement>('.diff')?.value;

    this.getWords(group).then((el) => {
      el.forEach((element: iWord) => {
        const { word, wordTranslate } = element;
        this.words.push({ word, wordTranslate });
      });
      this.renderContent(
        document.querySelector<HTMLElement>('.sprint__content__word'),
        document.querySelector<HTMLElement>('.sprint__content__translate')
      );
    });
  }

  async getWords(group: string | undefined) {
    const randPage = this.getRandomNum(0, 30);

    const response = await (
      await fetch(`https://rs-lang-irina-mokh.herokuapp.com/words?group=${group}&page=${randPage}`)
    ).json();
    return response;
  }

  getRandomNum(min: number, max: number) {
    return Math.round(Math.random() * (max - min) + min);
  }

  isCorrectTranslate() {
    if (this.getRandomNum(1, 2) === 1) {
      this.isCorrect = true;
      return true;
    }
    this.isCorrect = false;
    return false;
  }

  generateContentUI() {
    const word = document.createElement('h2');
    word.classList.add('sprint__content__word');

    const translatedWord = document.createElement('p');
    translatedWord.classList.add('sprint__content__translate');

    const btnsWrap = document.createElement('div');
    btnsWrap.classList.add('answer-btns');

    const wrongBtn = document.createElement('button');
    wrongBtn.classList.add('answer-btns__wrong');
    wrongBtn.innerHTML = 'Не верно';

    const correctBtn = document.createElement('button');
    correctBtn.classList.add('answer-btns__correct');
    correctBtn.innerHTML = 'Верно';

    const mark = document.createElement('img');
    mark.classList.add('answer-btns__mark', 'hidden');
    mark.src = '../../../assets/icons/tick.svg';
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

  generateStatisticUI() {
    console.log('UI');
  }

  animate(element: HTMLElement, name: string, time: string, animationFunc: string) {
    element.style.animationName = `${name}`;
    element.style.animationDuration = `${time}`;
    element.style.animationTimingFunction = `${animationFunc}`;
    element.style.animationFillMode = 'forwards';
  }
}
