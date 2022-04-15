import { state, createUserWord, changeUserWord } from '../../client/users';
import { vocab } from '../../../index';
import { iUserWord, iUserWordCreator, userWord } from '../types';
import html from './word.html';
import './word.scss';

export class Word {
  card: HTMLElement;

  id: string;

  group: number;

  page: number;

  word: string;

  image: string;

  audio: HTMLAudioElement;

  audioMeaning: HTMLAudioElement;

  audioExample: HTMLAudioElement;

  textMeaning: string;

  textExample: string;

  transcription: string;

  wordTranslate: string;

  textMeaningTranslate: string;

  textExampleTranslate: string;

  userWord?: userWord;

  isUserWord: boolean;

  difficult?: boolean;

  learnt?: boolean;

  level: number;

  config: iUserWordCreator;

  constructor(word: iUserWord, level: number) {
    this.card = document.createElement('li');
    this.id = word._id;
    this.group = word.group;
    this.page = word.page;
    this.word = word.word;
    this.image = word.image;
    this.audio = new Audio(`https://rs-lang-irina-mokh.herokuapp.com/${word.audio}`);
    this.audioMeaning = new Audio(`https://rs-lang-irina-mokh.herokuapp.com/${word.audioMeaning}`);
    this.audioExample = new Audio(`https://rs-lang-irina-mokh.herokuapp.com/${word.audioExample}`);
    this.textMeaning = word.textMeaning;
    this.textExample = word.textExample;
    this.transcription = word.transcription;
    this.wordTranslate = word.wordTranslate;
    this.textMeaningTranslate = word.textMeaningTranslate;
    this.textExampleTranslate = word.textExampleTranslate;
    this.userWord = word.userWord;
    this.difficult = false;
    this.learnt = false;
    this.level = level;
    this.isUserWord = false;
    this.config = {
      userId: state.currentUser?.id,
      wordId: this.id,
      userWord: {
        difficulty: 'basic',
        optional: {
          done: false,
          date: new Date(),
          rightAnswers: 0,
          wrongAnswers: 0,
        },
      },
    };
  }

  async render() {
    this.card.classList.add('word');
    this.card.innerHTML = html;
    const card = this.card as HTMLElement;
    function setData(selector: string, data: string) {
      const item = card.querySelector(`${selector}`) as HTMLElement;
      item.innerHTML = data;
    }
    const img = card.querySelector('img') as HTMLImageElement;
    img.src = `https://rs-lang-irina-mokh.herokuapp.com/${this.image}`;

    if (this.userWord) {
      this.isUserWord = true;
      this.difficult = this.userWord.difficulty === 'hard';
      this.learnt = this.userWord.optional.done;
    }
    setData('.word__en', this.word);
    setData('.word__ru', this.wordTranslate);
    setData('.word__transcript', this.transcription);
    setData('.word__meaning', this.textMeaning);
    setData('.word__example', this.textExample);
    setData('.word__meaning_ru', this.textMeaningTranslate);
    setData('.word__example_ru', this.textExampleTranslate);

    function setAttrBySelector(selector: string, attr: string, data: string) {
      const item = card.querySelector(`${selector}`) as HTMLElement;
      item.setAttribute(attr, data);
    }

    setAttrBySelector('.checkbox_done', 'id', `done${this.id}`);
    setAttrBySelector('.checkbox_done ~ label', 'for', `done${this.id}`);
    setAttrBySelector('.checkbox_difficult', 'id', `difficult${this.id}`);
    setAttrBySelector('.checkbox_difficult ~ label', 'for', `difficult${this.id}`);

    const audioBtn = card.querySelector('.btn_audio') as HTMLElement;
    let isPlaying = false;

    const playList = [this.audio, this.audioMeaning, this.audioExample];
    let i = 0;
    function playNext() {
      if (i < playList.length - 1) {
        i += 1;
        playList[i].play();
      } else {
        i = 0;
        audioBtn.classList.remove('btn_pause');
      }
    }

    for (let k = 0; k < playList.length; k += 1) {
      playList[k].addEventListener('ended', () => {
        playNext();
      });
    }

    audioBtn.addEventListener('click', async () => {
      if (!isPlaying) {
        isPlaying = true;
        audioBtn.classList.add('btn_pause');
        playList[i].play();
      } else {
        isPlaying = false;
        playList[i].pause();
        audioBtn.classList.remove('btn_pause');
      }
    });

    // learnt (done) words
    const doneBtn = card.querySelector('.btn_done') as HTMLElement;
    doneBtn.addEventListener('click', this.changeLearnt.bind(this));

    // difficult words
    const difficultBtn = card.querySelector('.btn_difficult') as HTMLElement;
    difficultBtn.addEventListener('click', this.changeDifficult.bind(this));

    // styling userWords
    if (this.difficult) {
      this.card.classList.add('word_difficult');
      (this.card.querySelector('.checkbox_difficult') as HTMLInputElement).checked = true;
    }

    if (this.learnt) {
      this.card.classList.add('word_done');
      (this.card.querySelector('.checkbox_done') as HTMLInputElement).checked = true;
    }

    // answers
    if (this.isUserWord) {
      const right = card.querySelector('.word__right-ans') as HTMLElement;
      const wrong = card.querySelector('.word__wrong-ans') as HTMLElement;
      right.innerHTML = String(this.userWord?.optional.rightAnswers || 0);
      wrong.innerHTML = String(this.userWord?.optional.wrongAnswers || 0);
    }

    return this.card;
  }

  changeDifficult() {
    if (this.difficult) {
      this.removeFromDifficult();
    } else {
      this.addToDifficult();
      this.isUserWord = true;
    }
  }

  changeLearnt() {
    if (this.learnt) {
      this.removeFromLearnt();
    } else {
      this.addToLearnt();
      this.isUserWord = true;
    }
  }

  removeFromLearnt = async () => {
    this.card.classList.remove('word_done');
    this.learnt = false;
    vocab.countLearnt(-1);
    this.config.userWord.optional.done = false;
    this.config.userWord.optional.date = new Date();
    this.updateUserWord();
  };

  async addToLearnt() {
    this.card.classList.add('word_done');
    this.learnt = true;
    vocab.countLearnt(1);
    (this.card.querySelector('.checkbox_difficult') as HTMLInputElement).checked = false;
    if (this.difficult) {
      this.removeFromDifficult();
    }
    this.config.userWord.optional.done = true;
    this.config.userWord.optional.date = new Date();
    this.updateUserWord();
  }

  async addToDifficult() {
    this.difficult = true;
    this.card.classList.add('word_difficult');
    this.config.userWord.difficulty = 'hard';
    if (this.learnt) {
      (this.card.querySelector('.btn_done') as HTMLElement).click();
    }
    this.updateUserWord();
  }

  async removeFromDifficult() {
    this.difficult = false;
    if (this.level === 6) {
      this.card.style.cssText = 'transition: all 0.3s ease; opacity: 0;transform: translate(-100%);';
      this.card.addEventListener('transitionend', () => {
        this.card.remove();
      });
    }
    this.card.classList.remove('word_difficult');
    this.config.userWord.difficulty = 'basic';
    this.updateUserWord();
  }

  updateUserWord() {
    if (this.isUserWord) {
      changeUserWord(this.config);
    } else {
      createUserWord(this.config);
    }
  }
}
