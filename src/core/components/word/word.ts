import { iWord } from '../types';
import html from './word.html';
import './word.scss';

export class Word {
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

  constructor(word: iWord) {
    this.id = word.id;
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
  }

  async render() {
    const card = document.createElement('li');
    card.classList.add('word');
    card.innerHTML = html;

    function setData(selector: string, data: string) {
      const item = card.querySelector(`${selector}`) as HTMLElement;
      item.innerHTML = data;
    }
    const img = card.querySelector('img') as HTMLImageElement;
    img.src = `https://rs-lang-irina-mokh.herokuapp.com/${this.image}`;

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
    doneBtn.addEventListener('click', () => {
      card.classList.toggle('word_done');
    });

    // difficult words
    const difficultBtn = card.querySelector('.btn_difficult') as HTMLElement;
    difficultBtn.addEventListener('click', () => {
      card.classList.toggle('word_difficult');
    });

    return card;
  }
}
