import { content, iWord } from '../../../core/components/types';
import { appearanceContent, changeContent, hide, show } from '../animation';
import { sprintStatistics } from '../statistics';
import { checkLocalStarage, createWord, getRandomNum, getWords, toggleHeaderBtns } from '../utils';
import html from './sprint.html';
import './sprint.scss';

export type GameWord = {
  word: string;
  transcription: string;
  wordTranslate: string;
  audio: string;
};

export class SprintGame implements content {
  timeLeft = 60;

  isCorrect = false;

  isGameOver = false;

  words: Array<GameWord> = [];

  wrongWords: Array<GameWord> = [];

  correctWords: Array<GameWord> = [];

  ids: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  currId = 0;

  currWordsInRow = 0;

  async render() {
    return html;
  }

  async run() {
    checkLocalStarage();
    toggleHeaderBtns(localStorage.getItem('sound') !== 'false');
    this.addListeners();
  }

  addListeners() {
    document.getElementById('startSprintGameBtn')?.addEventListener('click', () => {
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
    const { word, translatedWord, wrongBtn, correctBtn, mark } = this.generateContentUI();

    const correctSound = new Audio('../../../assets/sounds/correct.mp3');
    correctSound.volume = 0.5;
    const wrongSound = new Audio('../../../assets/sounds/wrong.mp3');

    const correctBtnPressed = () => {
      if (this.isCorrect && !correctBtn.classList.contains('disabled')) {
        correctBtn.classList.add('disabled');

        this.changeStat();

        this.correctWords.push(this.words[this.currId]);

        mark.src = '../../../assets/icons/tick.svg';
        mark.classList.remove('hidden');

        if (localStorage.getItem('sound') === 'true') {
          correctSound.play();
        }
        this.nextWord(mark, correctBtn, word, translatedWord);
      } else if (!correctBtn.classList.contains('disabled')) {
        correctBtn.classList.add('disabled');

        this.currWordsInRow = 0;

        this.wrongWords.push(this.words[this.currId]);

        mark.src = '../../../assets/icons/cross.svg';
        mark.classList.remove('hidden');

        if (localStorage.getItem('sound') === 'true') {
          wrongSound.play();
        }
        this.nextWord(mark, correctBtn, word, translatedWord);
      }
    };
    correctBtn.addEventListener('click', correctBtnPressed);

    const wrondBtnPressed = () => {
      if (!this.isCorrect && !wrongBtn.classList.contains('disabled')) {
        wrongBtn.classList.add('disabled');

        this.changeStat();

        this.correctWords.push(this.words[this.currId]);

        mark.src = '../../../assets/icons/tick.svg';
        mark.classList.remove('hidden');

        if (localStorage.getItem('sound') === 'true') {
          correctSound.play();
        }
        this.nextWord(mark, wrongBtn, word, translatedWord);
      } else if (!wrongBtn.classList.contains('disabled')) {
        wrongBtn.classList.add('disabled');

        this.currWordsInRow = 0;

        this.wrongWords.push(this.words[this.currId]);

        mark.src = '../../../assets/icons/cross.svg';
        mark.classList.remove('hidden');

        if (localStorage.getItem('sound') === 'true') {
          wrongSound.play();
        }
        this.nextWord(mark, wrongBtn, word, translatedWord);
      }
    };
    wrongBtn.addEventListener('click', wrondBtnPressed);

    const checkBtn = (ev: KeyboardEvent) => {
      if (this.isGameOver) {
        document.removeEventListener('keydown', checkBtn);
        return;
      }
      if (ev.code === 'ArrowLeft') {
        wrondBtnPressed();
      } else if (ev.code === 'ArrowRight') {
        correctBtnPressed();
      }
    };
    document.addEventListener('keydown', checkBtn);

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

        if (this.timeLeft === 0 || this.isGameOver) {
          this.gameOver();
          clearInterval(interval);

          this.isGameOver = true;
          this.timeLeft = 60;
          time.style.color = '';
          line.style.backgroundColor = '';
        }
      }, 1000);
    }, 3000);
  }

  renderContent(wordWrap: HTMLElement | null, translatedWordWrap: HTMLElement | null) {
    const id = this.chooseWord();
    if (id !== false) {
      this.currId = id;
      if (wordWrap !== null && translatedWordWrap !== null) {
        wordWrap.innerHTML = this.words[id].word;

        translatedWordWrap.innerHTML = this.words[this.isCorrectTranslate() ? id : getRandomNum(0, 19)].wordTranslate;
      }
    } else {
      this.gameOver();
      this.isGameOver = true;
    }
  }

  chooseWord() {
    if (this.ids.length === 0) {
      return false;
    }
    const randNum = getRandomNum(0, this.ids.length - 1);
    const id = this.ids[randNum];
    this.ids.splice(randNum, 1);
    return id;
  }

  gameOver() {
    if (this.isGameOver) {
      return;
    }
    sprintStatistics.gamesPlayed += 1;
    localStorage.setItem('sprintStatistics', JSON.stringify(sprintStatistics));

    const { progress, correctNums, wrongWords, correctWords } = this.generateStatisticsUI();

    progress.innerHTML = `Успешность: <b> ${((this.correctWords.length / 20) * 100).toFixed(0)}%</b>`;
    correctNums.innerHTML = `Правильных ответов: <b>${this.correctWords.length} / 20</b>`;

    this.wrongWords.forEach((el) => {
      wrongWords.appendChild(createWord(el));
    });
    this.correctWords.forEach((el) => {
      correctWords.appendChild(createWord(el));
    });
  }

  restart() {
    document.querySelector('.timer')?.remove();
    const wrap = document.querySelector('.sprint__content') as HTMLElement;
    wrap.style.overflow = 'clip';
    wrap.innerHTML = '';
    changeContent(wrap, 3000, 500, 300, 600, 300, 20, [0.05, 0.5, 0.7, 0.9]);

    this.isGameOver = false;
    this.words = [];
    this.correctWords = [];
    this.wrongWords = [];
    this.ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

    this.startGame();
  }

  generateWords() {
    const group = document.querySelector<HTMLSelectElement>('.diff')?.value;

    getWords(group).then((el) => {
      el.forEach((element: iWord) => {
        const { word, transcription, wordTranslate, audio } = element;
        this.words.push({ word, transcription, wordTranslate, audio });
      });
      this.renderContent(
        document.querySelector<HTMLElement>('.sprint__content__word'),
        document.querySelector<HTMLElement>('.sprint__content__translate')
      );
    });
  }

  isCorrectTranslate() {
    if (getRandomNum(1, 2) === 1) {
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

    changeContent(wrap, 3000, 600, 300, 600, 300, 20, [0.05, 0.5, 0.7, 0.9]);
    appearanceContent(word, 3200);
    appearanceContent(translatedWord, 3200);
    appearanceContent(btnsWrap, 3200);

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

    show(timerWrap, 3000, 600, 0.7);

    wrap.appendChild(timerWrap);

    return { time, line };
  }

  generateStatisticsUI() {
    const wrap = document.createElement('div');
    wrap.classList.add('statistics');

    const progress = document.createElement('p');
    progress.classList.add('statistics__progress');

    const correctNums = document.createElement('p');
    correctNums.classList.add('statistics__correct-num');

    const wrongWords = document.createElement('div');
    wrongWords.classList.add('statistics__mistakes');
    wrongWords.innerHTML = '<p>Не угадано:</p>';

    const correctWords = document.createElement('div');
    correctWords.classList.add('statistics__correctly');
    correctWords.innerHTML = '<p>Угадано:</p>';

    wrap.append(progress, correctNums, wrongWords, correctWords);

    const sprintContent = document.querySelector('.sprint__content') as HTMLElement;

    changeContent(sprintContent, 3000, 600, 300, 500, 300, 20, [0.05, 0.5, 0.7, 0.9]);
    appearanceContent(wrap, 3200);

    const timer = document.querySelector('.timer') as HTMLElement;
    hide(timer, 1500, 600, 64, 0);

    setTimeout(() => {
      timer.style.margin = '0';
    }, 1450);

    sprintContent.innerHTML = '';
    sprintContent.appendChild(wrap);

    setTimeout(() => {
      sprintContent.style.overflowY = 'scroll';
      this.createEndBtns();
    }, 3000);

    return { progress, correctNums, wrongWords, correctWords };
  }

  createEndBtns() {
    const btnsWrap = document.createElement('div');
    btnsWrap.classList.add('btns-wrap');

    const restart = document.createElement('button');
    restart.classList.add('restart');
    restart.innerHTML = 'Играть заново';

    restart.addEventListener('click', () => {
      this.restart();
      hide(btnsWrap, 1500, 500, 45, 0);
      setTimeout(() => {
        btnsWrap.remove();
      }, 1550);
    });

    const mainPage = document.createElement('button');
    mainPage.classList.add('main-page-btn');
    mainPage.innerHTML = 'Главная страница';

    mainPage.addEventListener('click', () => {
      window.location.href = '../';
    });

    btnsWrap.append(restart, mainPage);

    const wrap = document.querySelector('.sprint .container');
    wrap?.append(btnsWrap);
  }

  nextWord(mark: HTMLElement, btn: HTMLButtonElement, word: HTMLElement, translatedWord: HTMLElement) {
    setTimeout(() => {
      mark.classList.add('hidden');
      this.renderContent(word, translatedWord);
      btn.classList.remove('disabled');
    }, 500);
  }

  changeStat() {
    sprintStatistics.totalCorrectWords += 1;
    this.currWordsInRow += 1;
    sprintStatistics.mostWordsInRow =
      this.currWordsInRow > sprintStatistics.mostWordsInRow ? this.currWordsInRow : sprintStatistics.mostWordsInRow;

    localStorage.setItem('sprintStatistics', JSON.stringify(sprintStatistics));
  }
}
