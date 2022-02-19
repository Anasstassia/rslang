import { content, iWord } from '../../../core/components/types';
import { appearanceContent, changeContent, hide, show } from '../animation';
import {
  checkLocalStarage,
  createEndBtns,
  createWord,
  generateStatisticsUI,
  getRandomNum,
  getWords,
  toggleHeaderBtns,
} from '../utils';
import html from './audioCall.html';
import '../game.scss';
import './audioCall.scss';
import { GameWord } from '../sprint/sprint';
import { audioCallStatistics } from '../statistics';
import { updateAudioCallGameStatistics } from '../../../core/client/stat';

export class AudioCall implements content {
  words: Array<GameWord> = [];

  fakeWords: Array<string> = [];

  wordSound = new Audio();

  ids: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  currId = 0;

  currCorrectWord = '';

  correctPos = 0;

  correctWords: Array<GameWord> = [];

  wrongWords: Array<GameWord> = [];

  isHeartsOn = false;

  lives = 5;

  isGameOver = false;

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
      if (ev.code === 'Enter' && this.words.length === 0) {
        this.startGame();
        document.removeEventListener('keyup', startGame, true);
      } else document.removeEventListener('keyup', startGame, true);
    };
    document.addEventListener('keyup', startGame, true);
  }

  startGame() {
    const heartsCheckbox = document.getElementById('heartsCheckbox') as HTMLInputElement;
    let heartWrap: HTMLDivElement | false;
    if (this.isHeartsOn || heartsCheckbox?.checked) {
      this.isHeartsOn = true;
      heartWrap = this.generateHeartsUI();
    } else heartWrap = false;

    const { audioIcon, btnsWrap } = this.generateContentUI();

    Array.from(btnsWrap.children).forEach((btn) => {
      btn.addEventListener('click', () => {
        this.checkAnswer(heartWrap, btnsWrap, btn);
      });
    });

    const checkKey = (ev: KeyboardEvent) => {
      if (this.isGameOver) {
        document.removeEventListener('keyup', checkKey, true);
        return;
      }

      switch (ev.code) {
        case 'Digit1':
          if (!btnsWrap.children[0].classList.contains('disabled')) {
            this.checkAnswer(heartWrap, btnsWrap, btnsWrap.children[0]);
          }
          break;
        case 'Digit2':
          if (!btnsWrap.children[1].classList.contains('disabled')) {
            this.checkAnswer(heartWrap, btnsWrap, btnsWrap.children[1]);
          }
          break;
        case 'Digit3':
          if (!btnsWrap.children[2].classList.contains('disabled')) {
            this.checkAnswer(heartWrap, btnsWrap, btnsWrap.children[2]);
          }
          break;
        case 'Digit4':
          if (!btnsWrap.children[3].classList.contains('disabled')) {
            this.checkAnswer(heartWrap, btnsWrap, btnsWrap.children[3]);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keyup', checkKey, true);

    audioIcon.addEventListener('click', () => {
      if (this.lives > 0) {
        this.wordSound.play();
      }
    });
  }

  checkAnswer(heartWrap: HTMLDivElement | false, btnsWrap: HTMLDivElement, currBtn: Element) {
    if (!currBtn.classList.contains('disabled') && this.lives > 0) {
      const correctSound = new Audio('../../../assets/sounds/correct.mp3');
      correctSound.volume = 0.5;
      const wrongSound = new Audio('../../../assets/sounds/wrong.mp3');

      Array.from(btnsWrap.children).forEach((item) => {
        if (item.id === this.correctPos.toString()) {
          item.classList.add('correct', 'disabled');
        } else {
          item.classList.add('wrong', 'disabled');
        }
      });
      if (currBtn.innerHTML === this.currCorrectWord) {
        this.nextWord(btnsWrap);
        this.correctWords.push(this.words[this.currId]);
        if (localStorage.getItem('sound') === 'true') {
          correctSound.play();
        }
      } else {
        if (heartWrap) {
          const heart = heartWrap.children.item(this.lives - 1);
          heart?.classList.add('transition-hide');
          setTimeout(() => {
            heart?.classList.add('hide');
          }, 950);
          this.lives -= 1;
        }

        if (this.lives === 0) {
          setTimeout(() => {
            Array.from(btnsWrap.children).forEach((item) => {
              item.classList.remove('wrong', 'correct', 'disabled');
            });
            setTimeout(() => {
              this.isGameOver = true;
              this.gameOver();
            }, 500);
          }, 1500);
        } else {
          this.nextWord(btnsWrap);
          this.wrongWords.push(this.words[this.currId]);
        }

        if (localStorage.getItem('sound') === 'true') {
          wrongSound.play();
        }
      }
    }
  }

  gameOver() {
    audioCallStatistics.gamesPlayed += 1;
    audioCallStatistics.currentDay = new Date();
    localStorage.setItem('audioCallStatistics', JSON.stringify(audioCallStatistics));

    const { progress, correctNums, wrongWords, correctWords } = generateStatisticsUI('audio-call', 750);
    setTimeout(() => {
      document.querySelector<HTMLElement>('.audio-call__content')!.style.overflowY = 'scroll';
      const { restart, btnsWrap } = createEndBtns('audio-call');
      restart.addEventListener('click', () => {
        this.restart();
        hide(btnsWrap, 1500, 500, 45, 0);
        setTimeout(() => {
          btnsWrap.remove();
        }, 1550);
      });
    }, 3000);

    progress.innerHTML = `Успешность: <b> ${((this.correctWords.length / 20) * 100).toFixed(0)}%</b>`;
    correctNums.innerHTML = `Правильных ответов: <b>${this.correctWords.length} / 20</b>`;

    this.wrongWords.forEach((el) => {
      wrongWords.appendChild(createWord(el));
    });
    this.correctWords.forEach((el) => {
      correctWords.appendChild(createWord(el));
    });

    updateAudioCallGameStatistics({
      gamesPlayed: audioCallStatistics.gamesPlayed,
      totalCorrectWords: audioCallStatistics.totalCorrectWords,
      mostWordsInRow: audioCallStatistics.mostWordsInRow,
      newWords: 0,
    });
  }

  generateHeartsUI() {
    const heartWrap = document.createElement('div');
    heartWrap.classList.add('hearts');

    for (let i = 1; i < 6; i += 1) {
      const heart = document.createElement('div');
      heart.classList.add('hearts__item');
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

    for (let i = 0; i < 4; i += 1) {
      const btn = document.createElement('button');
      btn.id = i.toString();
      btnsWrap.appendChild(btn);
    }

    this.generateWords();

    changeContent(wrap, 3000, 600, 300, 750, 300, 20, [0.05, 0.5, 0.7, 0.9]);
    appearanceContent(audioIcon, 3200);
    appearanceContent(btnsWrap, 3200);

    wrap.innerHTML = '';
    wrap.append(audioIcon, btnsWrap);

    return { audioIcon, btnsWrap };
  }

  generateWords() {
    const group = document.querySelector<HTMLSelectElement>('.diff')?.value;

    getWords(group).then((el) => {
      el.forEach((element: iWord) => {
        const { word, transcription, wordTranslate, audio, id } = element;
        this.words.push({ word, transcription, wordTranslate, audio, id });
      });
      this.renderContent(document.querySelectorAll('.audio-call__content__answer-btns button'), 2800);
    });

    getWords(group).then((el) => {
      el.forEach((element: iWord) => {
        this.fakeWords.push(element.wordTranslate);
      });
    });
    getWords(group).then((el) => {
      el.forEach((element: iWord) => {
        this.fakeWords.push(element.wordTranslate);
      });
    });
  }

  renderContent(buttons: NodeListOf<HTMLButtonElement> | Element[], soundDelay: number) {
    const id = this.chooseWord();

    if (id !== false) {
      this.currId = id;
      const { wordTranslate } = this.words[id];

      this.wordSound.src = `https://rs-lang-irina-mokh.herokuapp.com/${this.words[id].audio}`;
      setTimeout(() => {
        this.wordSound.play();
      }, soundDelay);

      const randPos = getRandomNum(0, 3);
      this.correctPos = randPos;

      const tempFakeWords = [...this.fakeWords];
      const index = this.fakeWords.indexOf(wordTranslate);
      if (index !== -1) {
        this.fakeWords.splice(index, 1);
      }
      buttons.forEach((item) => {
        const fakeId = getRandomNum(0, this.fakeWords.length - 1);
        item.innerHTML = this.fakeWords[fakeId];
        this.fakeWords.splice(fakeId, 1);
      });
      this.fakeWords = tempFakeWords;

      buttons[randPos].innerHTML = wordTranslate;
      this.currCorrectWord = wordTranslate;
    } else {
      this.isGameOver = true;
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

  nextWord(btnsWrap: HTMLElement) {
    setTimeout(() => {
      const arr = Array.from(btnsWrap.children);
      this.renderContent(arr, 300);
      arr.forEach((item) => {
        item.classList.remove('wrong', 'correct', 'disabled');
      });
    }, 2000);
  }

  restart() {
    const wrap = document.querySelector('.audio-call__content') as HTMLElement;
    wrap.style.overflow = 'clip';
    wrap.innerHTML = '';
    changeContent(wrap, 3000, 500, 300, 600, 300, 20, [0.05, 0.5, 0.7, 0.9]);

    this.isGameOver = false;
    this.words = [];
    this.fakeWords = [];
    this.correctWords = [];
    this.ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    this.wrongWords = [];
    this.lives = 5;
    this.currId = 0;
    this.currCorrectWord = '';
    this.correctPos = 0;
    this.startGame();
  }
}
