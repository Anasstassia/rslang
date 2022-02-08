import { content, iUserWord } from '../../core/components/types';
import html from './vocab.html';
import './vocab.scss';
import { client } from '../../core/client';
import { state } from '../../core/client/users';
import { Word } from '../../core/components/word';

export class Vocab implements content {
  page: number;

  group: number;

  vocabList?: HTMLElement;

  requestType: string;

  constructor() {
    this.page = 0;
    this.group = 0;
    this.requestType = 'basic';
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
      this.requestType = 'basic';
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

    // difficult words
    const difficultWords = document.querySelector('.vocab__difficult') as HTMLElement;
    difficultWords.addEventListener('click', () => {
      this.requestType = 'difficult';
      this.renderWords();
      lvlHeader.innerHTML = 'Сложные слова';
      vocab.className = 'vocab section container';
      vocab.classList.add(`vocab_difficult`);
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
          `/users/${state.currentUser?.userId}/aggregatedWords?group=${this.group}&page=${this.page}&wordsPerPage=20}`
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
      const word = await new Word(item).render();
      this.vocabList?.append(word);
    });
  };
}
