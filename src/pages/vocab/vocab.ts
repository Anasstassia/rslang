import { content, iWord } from '../../core/components/types';
import html from './vocab.html';
import './vocab.scss';
import { client } from '../../core/client';
import { Word } from '../../core/components/word';

export class Vocab implements content {
  page: number;

  group: number;

  vocabList?: HTMLElement;

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
      this.group = Number(levelSelect.value);
      const levlClass = levels[this.group].slice(0, 2);

      vocab.className = 'vocab section container';

      vocab.classList.add(`vocab_${levlClass.toLowerCase()}`);
      lvlHeader.innerHTML = levels[this.group];
      pagesEl.value = String(0);
      this.page = 0;
      this.renderWords();
    });

    // render pages list
    const pagesEl = document.querySelector('.btn_page') as HTMLSelectElement;
    const pageId = pagesEl.querySelector('option') as HTMLElement;
    for (let i = 2; i <= PAGES; i += 1) {
      const item = pageId.cloneNode() as HTMLInputElement;
      item.innerHTML = String(i);
      item.value = String(i - 1);
      pagesEl.append(item);
    }

    // render words by page
    pagesEl.addEventListener('change', () => {
      this.page = Number(pagesEl.value);
      this.renderWords();
    });

    const pagePrev = document.querySelector('.btn_prev') as HTMLElement;
    const pageNext = document.querySelector('.btn_next') as HTMLElement;
    pagePrev.addEventListener('click', () => {
      if (this.page === 0) {
        this.page = 29;
      } else {
        this.page -= 1;
      }
      pagesEl.value = String(this.page);
      this.renderWords();
    });

    pageNext.addEventListener('click', () => {
      if (this.page === 29) {
        this.page = 0;
      } else {
        this.page += 1;
      }
      pagesEl.value = String(this.page);
      this.renderWords();
    });

    await this.renderWords();
    return undefined;
  }

  getWords = async () => {
    const response = await client.get(`/words?group=${this.group}&page=${this.page}`);
    const data = await response.data;
    return data;
  };

  renderWords = async () => {
    if (!this.vocabList) return;
    this.vocabList.innerHTML = '';
    const items = await this.getWords();
    items.forEach(async (item: iWord) => {
      const word = await new Word(item).render();
      this.vocabList?.append(word);
    });
  };
}
