import { checkScore, countAnswersForUserWord, state } from '../../../core/client/users';
import { content, iWord } from '../../../core/components/types';
import { appearanceContent, changeContent, hide, show } from '../animation';
import {
  checkPlaceOfOpening,
  checkSoundLocalStarage,
  createEndBtns,
  createWord,
  generateStatisticsUI,
  getRandomNum,
  getWords,
  toggleHeaderBtns,
} from '../utils';
import html from './sprint.html';
import '../game.scss';
import './sprint.scss';
import { updateSprintGameStatistics } from '../../../core/client/stat';

export type GameWord = {
  word: string;
  transcription: string;
  wordTranslate: string;
  audio: string;
  id: string;
};
export class SprintGame implements content {
  timeLeft = 60;

  isCorrect = false;

  isGameOver = false;

  words: Array<GameWord> = [];

  fakeWords: Array<string> = [];

  wrongWords: Array<GameWord> = [];

  correctWords: Array<GameWord> = [];

  ids: Array<number> = [];

  currId = 0;

  currWordsInRow = 0;

  IsGameOpenFromVocabPage = false;

  async render() {
    return html;
  }

  async run() {
    this.IsGameOpenFromVocabPage = checkPlaceOfOpening();
    checkSoundLocalStarage();
    toggleHeaderBtns(localStorage.getItem('sound') !== 'false');
    this.addListeners();
    this.resetData();
  }

  addListeners() {
    document.getElementById('startSprintGameBtn')?.addEventListener('click', () => {
      this.startGame();
    });
    const startGame = (ev: KeyboardEvent) => {
      if (ev.code === 'Enter') {
        this.startGame();
        document.removeEventListener('keydown', startGame, true);
      }
    };
    document.addEventListener('keydown', startGame, true);
  }

  startGame() {
    this.resetData();

    const { time, line } = this.generateTimerUI();
    const { word, translatedWord, wrongBtn, correctBtn, correctMark, wrongMark } = this.generateContentUI();

    const correctSound = new Audio('../../../assets/sounds/correct.mp3');
    correctSound.volume = 0.5;
    const wrongSound = new Audio('../../../assets/sounds/wrong.mp3');

    const correctBtnPressed = () => {
      if (this.isCorrect && !correctBtn.classList.contains('disabled') && !wrongBtn.classList.contains('disabled')) {
        correctBtn.classList.add('disabled');
        wrongBtn.classList.add('disabled');

        this.changeStat();

        this.correctWords.push(this.words[this.currId]);

        correctMark.classList.remove('hidden');

        if (localStorage.getItem('sound') === 'true') {
          correctSound.play();
        }
        this.nextWord(correctMark, { correctBtn, wrongBtn }, word, translatedWord);
        countAnswersForUserWord(this.words[this.currId].id, true);
      } else if (!correctBtn.classList.contains('disabled') && !wrongBtn.classList.contains('disabled')) {
        correctBtn.classList.add('disabled');
        wrongBtn.classList.add('disabled');

        this.currWordsInRow = 0;

        this.wrongWords.push(this.words[this.currId]);

        wrongMark.classList.remove('hidden');

        if (localStorage.getItem('sound') === 'true') {
          wrongSound.play();
        }
        this.nextWord(wrongMark, { correctBtn, wrongBtn }, word, translatedWord);
        countAnswersForUserWord(this.words[this.currId].id, false);
      }
    };
    correctBtn.addEventListener('click', correctBtnPressed);

    const wrondBtnPressed = () => {
      if (!this.isCorrect && !wrongBtn.classList.contains('disabled') && !correctBtn.classList.contains('disabled')) {
        wrongBtn.classList.add('disabled');
        correctBtn.classList.add('disabled');

        this.changeStat();

        this.correctWords.push(this.words[this.currId]);

        correctMark.classList.remove('hidden');

        if (localStorage.getItem('sound') === 'true') {
          correctSound.play();
        }
        this.nextWord(correctMark, { correctBtn, wrongBtn }, word, translatedWord);
        countAnswersForUserWord(this.words[this.currId].id, true);
      } else if (!wrongBtn.classList.contains('disabled') && !correctBtn.classList.contains('disabled')) {
        wrongBtn.classList.add('disabled');
        correctBtn.classList.add('disabled');

        this.currWordsInRow = 0;

        this.wrongWords.push(this.words[this.currId]);

        wrongMark.classList.remove('hidden');

        if (localStorage.getItem('sound') === 'true') {
          wrongSound.play();
        }
        this.nextWord(wrongMark, { correctBtn, wrongBtn }, word, translatedWord);
        countAnswersForUserWord(this.words[this.currId].id, false);
      }
    };
    wrongBtn.addEventListener('click', wrondBtnPressed);

    const checkBtn = (ev: KeyboardEvent) => {
      if (this.isGameOver) {
        document.removeEventListener('keyup', checkBtn, true);
        return;
      }
      if (ev.code === 'ArrowLeft') {
        wrondBtnPressed();
      } else if (ev.code === 'ArrowRight') {
        correctBtnPressed();
      }
    };
    document.addEventListener('keyup', checkBtn, true);

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
        if (this.isGameOver) {
          clearInterval(interval);
        }
        if (this.timeLeft === 0) {
          this.gameOver();
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

        if (this.isCorrectTranslate()) {
          translatedWordWrap.innerHTML = this.words[id].wordTranslate;
        } else {
          const tempFaleWords = [...this.fakeWords];
          this.fakeWords.splice(id, 1);
          translatedWordWrap.innerHTML = this.fakeWords[getRandomNum(0, this.fakeWords.length - 1)];
          this.fakeWords = tempFaleWords;
        }
      }
    } else {
      this.gameOver();
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
    if (this.isGameOver) return;
    if (state.sprintStatistics && state.currentUser) state.sprintStatistics.gamesPlayed += 1;

    this.isGameOver = true;
    document.dispatchEvent(
      new KeyboardEvent('keyup', {
        key: 'Shift',
      })
    );

    const { progress, correctNums, wrongWords, correctWords } = generateStatisticsUI('sprint', 600);
    setTimeout(() => {
      document.querySelector<HTMLElement>('.sprint__content')!.style.overflowY = 'scroll';
      const { restart, btnsWrap } = createEndBtns('sprint');
      restart.addEventListener('click', () => {
        this.restart();
        hide(btnsWrap, 1500, 500, 45, 0);
        setTimeout(() => {
          btnsWrap.remove();
        }, 1550);
      });
    }, 3000);

    progress.innerHTML = `Успешность: <b> ${((this.correctWords.length / this.words.length) * 100).toFixed(0)}%</b>`;
    correctNums.innerHTML = `Правильных ответов: <b>${this.correctWords.length} / ${this.words.length}</b>`;

    this.wrongWords.forEach((el) => {
      wrongWords.appendChild(createWord(el));
    });
    this.correctWords.forEach((el) => {
      correctWords.appendChild(createWord(el));
    });

    if (state.currentUser) {
      const allWordsId = this.words.map((el) => el.id);
      checkScore(allWordsId).then((score) => {
        if (state?.sprintStatistics) {
          state.sprintStatistics.newWords += score;
          updateSprintGameStatistics(state.sprintStatistics);
        }
      });
    }
  }

  restart() {
    const wrap = document.querySelector('.sprint__content') as HTMLElement;
    wrap.style.overflow = 'clip';
    wrap.innerHTML = '';
    changeContent(wrap, 3000, 500, 300, 600, 300, 20, [0.05, 0.5, 0.7, 0.9]);

    this.startGame();
  }

  generateWords() {
    const group = document.querySelector<HTMLSelectElement>('.diff')?.value;

    getWords(group, this.IsGameOpenFromVocabPage, false).then((el) => {
      el.forEach((element: iWord) => {
        const { word, transcription, wordTranslate, audio, id } = element;
        this.words.push({ word, transcription, wordTranslate, audio, id });
      });
      for (let i = 0; i < this.words.length; i += 1) {
        this.ids.push(i);
      }

      getWords(group, this.IsGameOpenFromVocabPage, true).then((fakeEl) => {
        fakeEl.forEach((element: iWord) => {
          this.fakeWords.push(element.wordTranslate);
        });
        this.renderContent(
          document.querySelector<HTMLElement>('.sprint__content__word'),
          document.querySelector<HTMLElement>('.sprint__content__translate')
        );
      });
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

    const marksWrap = document.createElement('div');
    marksWrap.classList.add('answer-btns__marks');

    const correctMark = document.createElement('img');
    correctMark.classList.add('mark', 'hidden');
    correctMark.src = '../../../assets/icons/tick.svg';
    correctMark.alt = 'mark';

    const wrongMark = document.createElement('img');
    wrongMark.classList.add('mark', 'hidden');
    wrongMark.src = '../../../assets/icons/cross.svg';
    wrongMark.alt = 'mark';

    marksWrap.append(correctMark, wrongMark);

    btnsWrap.append(wrongBtn, marksWrap, correctBtn);

    const wrap = document.querySelector('.sprint__content') as HTMLElement;

    this.generateWords();

    changeContent(wrap, 3000, 600, 300, 600, 300, 20, [0.05, 0.5, 0.7, 0.9]);
    appearanceContent(word, 3200);
    appearanceContent(translatedWord, 3200);
    appearanceContent(btnsWrap, 3200);

    wrap.innerHTML = '';
    wrap.append(word, translatedWord, btnsWrap);

    return { word, translatedWord, wrongBtn, correctBtn, correctMark, wrongMark };
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

  nextWord(
    mark: HTMLElement,
    btns: { correctBtn: HTMLButtonElement; wrongBtn: HTMLButtonElement },
    word: HTMLElement,
    translatedWord: HTMLElement
  ) {
    setTimeout(() => {
      mark.classList.add('hidden');
      this.renderContent(word, translatedWord);
      btns.correctBtn.classList.remove('disabled');
      btns.wrongBtn.classList.remove('disabled');
    }, 500);
  }

  changeStat() {
    if (!state.sprintStatistics) return;
    state.sprintStatistics.totalCorrectWords += 1;
    this.currWordsInRow += 1;
    state.sprintStatistics.mostWordsInRow =
      this.currWordsInRow > state.sprintStatistics.mostWordsInRow
        ? this.currWordsInRow
        : state.sprintStatistics.mostWordsInRow;
  }

  resetData() {
    this.isGameOver = false;
    this.words = [];
    this.fakeWords = [];
    this.correctWords = [];
    this.wrongWords = [];
    this.ids = [];
    this.currId = 0;
    this.timeLeft = 60;
  }
}
