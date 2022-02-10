/* eslint-disable no-underscore-dangle */
import { content, iUserWord } from '../../core/components/types';
import html from './vocab.html';
import './vocab.scss';
import { client } from '../../core/client';
import { state } from '../../core/client/users';
import { Word } from '../../core/components/word';

export class Vocab implements content {
  _page: number;

  _group: number;

  vocabList?: HTMLElement;

  _requestType: string;

  levels: { [key: string]: string };

  levelSelect: HTMLSelectElement;

  vocab: HTMLElement;

  levelHeader: HTMLElement;

  pagesEl: HTMLSelectElement;

  constructor() {
    this._page = Number(localStorage.page);
    this._group = Number(localStorage.group);
    this._requestType = localStorage.request;
    this.levels = {
      '0': 'A1 Beginner',
      '1': 'A2 Elementary',
      '2': 'B1 Intermediate',
      '3': 'B2 Upper Intermediate',
      '4': 'C1 Advanced',
      '5': 'C2 Proficiency',
      '6': 'Сложные слова',
    };
    this.levelSelect = document.querySelector('.level') as HTMLSelectElement;
    this.vocab = document.querySelector('.vocab') as HTMLElement;
    this.vocabList = document.querySelector('.vocab__page') as HTMLElement;
    this.levelHeader = document.querySelector('.vocab__level-name') as HTMLElement;
    this.pagesEl = document.querySelector('.btn_page') as HTMLSelectElement;
  }

  get page() {
    return this._page;
  }

  set page(i: number) {
    localStorage.setItem('page', String(i));
    this._page = i;
  }

  get group() {
    return this._group;
  }

  set group(i: number) {
    localStorage.setItem('group', String(i));
    this._group = i;
  }

  get requestType() {
    return this._requestType;
  }

  set requestType(i: string) {
    localStorage.setItem('request', String(i));
    this._requestType = i;
  }

  async render() {
    return html;
  }

  async run() {
    const PAGES = 30;
    this.levelSelect = document.querySelector('.level') as HTMLSelectElement;
    this.vocab = document.querySelector('.vocab') as HTMLElement;
    this.vocabList = document.querySelector('.vocab__page') as HTMLElement;
    this.levelHeader = document.querySelector('.vocab__level-name') as HTMLElement;
    this.pagesEl = document.querySelector('.btn_page') as HTMLSelectElement;

    // change group
    this.levelSelect.addEventListener('change', () => {
      this.resetRequest(0, Number(this.levelSelect.value), 'basic');
      this.renderGroup();
    });
    this.levelSelect.addEventListener('click', () => {
      this.resetRequest(0, Number(this.levelSelect.value), 'basic');
      if (this.group === 6) {
        this.renderGroup();
      }
    });
    this.renderGroup();

    // render pages list
    const pageId = this.pagesEl.querySelector('option') as HTMLElement;
    for (let i = 2; i <= PAGES; i += 1) {
      const item = pageId.cloneNode() as HTMLInputElement;
      item.innerHTML = String(i);
      item.value = String(i - 1);
      this.pagesEl.append(item);
    }
    this.pagesEl.value = String(this.page);

    // render words by page
    this.pagesEl.addEventListener('change', () => {
      this.page = Number(this.pagesEl.value);
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
      this.pagesEl.value = String(this.page);
      this.renderWords();
    });

    pageNext.addEventListener('click', () => {
      if (this.page === 29) {
        this.page = 0;
      } else {
        this.page += 1;
      }
      this.pagesEl.value = String(this.page);
      this.renderWords();
    });

    // difficult words
    const difficultWords = document.querySelector('.vocab__difficult') as HTMLElement;
    difficultWords.addEventListener('click', () => {
      this.resetRequest(0, 6, 'difficult');
      this.renderGroup();
      this.renderWords();
      this.levelSelect?.classList.add('level_not-active');
      document.querySelector('.pagination')?.classList.add('hide');
    });

    await this.renderWords();
    return undefined;
  }

  getWords = async (request: string) => {
    let response = null;
    let data = null;
    if (request === 'basic') {
      if (state.currentUser?.userId) {
        response = await client.get(
          `/users/${state.currentUser?.userId}/aggregatedWords?wordsPerPage=20&filter={"$and": [{"page":${this.page}},{"group":${this.group}}]}`
        );
        data = response.data[0].paginatedResults;
      } else {
        response = await client.get(`/words?group=${this.group}&page=${this.page}`);
        data = response.data;
      }
    } else if (request === 'difficult') {
      /*
      response = await client.get(
        `/users/${state.currentUser?.userId}/aggregatedWords?&wordsPerPage=200&filter={"userWord.difficulty":"hard"`
      );
      data = response.data[0].paginatedResults;
      */
      response = await fetch(
        `https://rs-lang-irina-mokh.herokuapp.com/users/${state.currentUser?.userId}/aggregatedWords?filter={"userWord.difficulty":"hard"}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      const json = await response.json();
      data = json[0].paginatedResults;
    }
    return data;
  };

  renderWords = async () => {
    if (!this.vocabList) return;
    this.vocabList.innerHTML = '';
    const items = await this.getWords(this.requestType);
    items.forEach(async (item: iUserWord) => {
      const word = await new Word(item, this.group).render();
      this.vocabList?.append(word);
    });
  };

  renderGroup = async () => {
    this.levelSelect.classList.remove('level_not-active');
    this.levelSelect.value = String(this.group);
    this.pagesEl.value = String(this.page);
    document.querySelector('.pagination')?.classList.remove('hide');
    this.vocab.className = 'vocab section container';
    if (this.group < 6) {
      const levlClass = this.levels[this.group].slice(0, 2);
      this.vocab.classList.add(`vocab_${levlClass.toLowerCase()}`);
    } else {
      this.vocab.classList.add(`vocab_difficult`);
    }
    this.levelHeader.innerHTML = this.levels[this.group];
    this.renderWords();
  };

  resetRequest = async (page?: number, group?: number, requestType?: string) => {
    if (group) {
      this.group = group;
    }
    if (page !== undefined) {
      this.page = page;
    }
    if (requestType) {
      this.requestType = requestType;
    }
  };
}
