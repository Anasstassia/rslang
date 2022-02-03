import { content, iWord } from '../../core/components/types';
import html from './vocab.html';
import './vocab.scss';
import { client } from '../../core/client';
import { Word } from '../../core/components/word';

export class Vocab implements content {
  page: number;
  group: number | string;
  vocabList: any;

  constructor() {
    this.page = 0;
    this.group = 0;
  }

  async render() {
    return html;
  }

  async run() {
    const levels: { [key: string]: string } = {
      '0': 'A1 Beginner',
      '1': 'A2 Elementary',
      '2': 'B1 Intermediate',
      '3': 'B2 Upper Intermediate',
      '4': 'C1 Advanced',
      '5': 'C2 Proficiency',
    };
    const PAGES = 30;

    const levelSelect = document.querySelector('.level') as HTMLSelectElement;
    const vocab = document.querySelector('.vocab') as HTMLElement;
    this.vocabList = document.querySelector('.vocab__page') as HTMLElement;
    const lvlHeader = document.querySelector('.vocab__level-name') as HTMLElement;

    // change group

    levelSelect.addEventListener('change', () => {
      this.group = levelSelect.value;
      vocab.classList.add(`vocab_${this.group}`);
      lvlHeader.innerHTML = levels[this.group];
      this.renderWords();
    });

    // render pages list
    const pagesEl = document.querySelector('.btn_page') as HTMLElement;
    const pageId = pagesEl.querySelector('option') as HTMLElement;
    for (let i = 2; i <= PAGES; i += 1) {
      const item = pageId.cloneNode() as HTMLInputElement;
      item.innerHTML = String(i);
      item.value = String(i);
      pagesEl.append(item);
    }

    this.renderWords();
    return undefined;
  }

  getWords = async () => {
    const response = await client.get(`/words?group=${this.group}&page=${this.page}`);
    const data = await response.data;
    return data;
  };

  renderWords = async () => {
    this.vocabList.innerHTML = '';
    let items = await this.getWords();
    items.forEach(async (item: iWord) => {
      const word = await new Word(item).render();
      this.vocabList.append(word);
    });
  };
}
