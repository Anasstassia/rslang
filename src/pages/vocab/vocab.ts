/* eslint-disable no-underscore-dangle */
import { content, iUserWord } from '../../core/components/types';
import html from './vocab.html';
import './vocab.scss';
import { client } from '../../core/client';
import { state } from '../../core/client/users';
import { Word } from '../../core/components/word';
import { stats } from '../../index';
// import { Utils } from '../../core/utils/utils';

const PAGES = 30;

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
    // для удаления userwords И очистки изученных в статистике
    /*
    if (state.currentUser) {
      await Utils.resetData();
    }
    */

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

    // render pages list
    for (let i = 1; i <= PAGES; i += 1) {
      const item = document.createElement('option');
      item.classList.add('page__option');
      item.innerHTML = String(i);
      item.value = String(i - 1);
      this.pagesEl.append(item);
    }
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
      this.levelSelect?.classList.add('level_not-active');
      document.querySelector('.pagination')?.classList.add('hide');
    });

    await this.renderGroup();
    return undefined;
  }

  getWords = async (request: string) => {
    let response = null;
    let data = null;
    if (request === 'basic') {
      if (state.currentUser) {
        response = await client.get(
          `/users/${state.currentUser?.id}/aggregatedWords?wordsPerPage=20&filter={"$and": [{"page":${this.page}},{"group":${this.group}}]}`
        );
        data = response.data[0].paginatedResults;
      } else {
        response = await client.get(`/words?group=${this.group}&page=${this.page}`);
        data = response.data;
      }
    } else if (request === 'difficult') {
      response = await client.get(
        `/users/${state.currentUser?.id}/aggregatedWords?wordsPerPage=200&filter={"userWord.difficulty":"hard"}`
      );
      data = response.data[0].paginatedResults;
    }
    return data;
  };

  renderWords = async () => {
    this.markLearnedPages();
    if (!this.vocabList) return;
    this.vocabList.innerHTML = '';
    const items = await this.getWords(this.requestType);
    await items.forEach(async (item: iUserWord) => {
      const word = await new Word(item, this.group).render();
      this.vocabList?.append(word);
    });
    if (items.length === 0) {
      this.vocabList.innerHTML = 'Сложные слова пока не добавлены';
    } else if (items.length > 0 && document.querySelectorAll('.word_done').length === items.length) {
      this.makePageLearnt();
    } else {
      this.unlearnPage();
    }
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
    await this.renderWords();
  };

  resetRequest = async (page?: number, group?: number, requestType?: string) => {
    if (group !== undefined) {
      this.group = group;
    }
    if (page !== undefined) {
      this.page = page;
    }
    if (requestType) {
      this.requestType = requestType;
    }
  };

  countLearnt = async (i: number) => {
    stats.learnedWords += i;
    await stats.update();
    if (document.querySelectorAll('.word_done').length === document.querySelectorAll('.word').length) {
      this.makePageLearnt();
    } else {
      this.unlearnPage();
    }
  };

  makePageLearnt = async () => {
    stats.learnedPages[this.group].push(this.page);
    await stats.update();
    this.vocab.classList.add('vocab_learnt', 'slideIn');
    const currentPage = document.querySelector(`.page__option[value="${this.page}"]`) as HTMLElement;
    currentPage.innerHTML = `${this.page + 1} &#10003;`;
  };

  unlearnPage = async () => {
    if (this.vocab.classList.contains('slideIn')) {
      this.vocab.classList.remove('slideIn');
      this.vocab.classList.add('slideOut');
    }
    this.vocab.addEventListener(
      'animationend',
      () => {
        if (this.vocab.classList.contains('vocab_learnt') && this.vocab.classList.contains('slideOut')) {
          this.vocab.classList.remove('vocab_learnt', 'slideOut');
        }
      },
      { once: true }
    );

    const currentPage = document.querySelector(`.page__option[value="${this.page}"]`) as HTMLElement;
    currentPage.innerHTML = `${this.page + 1}`;
    const newPages = stats.learnedPages[this.group].filter((i) => i !== this.page);
    stats.learnedPages[this.group] = newPages;
    await stats.update();
  };

  markLearnedPages = async () => {
    const pages = document.querySelectorAll('.page__option') as NodeListOf<HTMLInputElement>;
    await stats.update();
    const learnedPages = stats.learnedPages[this.group];
    pages.forEach((item) => {
      if (learnedPages.includes(Number(item.value))) {
        item.innerHTML = `${Number(item.value) + 1} &#10003;`;
      } else {
        item.innerHTML = `${Number(item.value) + 1}`;
      }
    });
  };
}
