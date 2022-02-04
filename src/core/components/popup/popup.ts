import { content } from '../types';
// import { Form } from './form/form';
import html from './popup.html';
import './popup.scss';

export class Popup implements content {
  // constructor() {}

  async render() {
    return html;
  }

  async run() {
    this.addListeners();
  }

  addListeners = () => {
    const elements = document.querySelectorAll('.popup__wrapper .tab');
    elements.forEach((el) =>
      el.addEventListener('click', () => {
        elements.forEach((label) => label.classList.remove('active-tab'));
        el.classList.add('active-tab');
        this.showForm(el.getAttribute('data-form') || '');
      })
    );

    document.body.addEventListener('click', (event) => {
      const popup = document.querySelector('.popup__wrapper');
      const loginButton = document.querySelector('.btn_auth');
      if (!popup || !loginButton) return;
      const withinBoundaries = event.composedPath().includes(popup) || event.composedPath().includes(loginButton);
      if (!withinBoundaries) {
        document.querySelector('.popup')?.classList.remove('active');
      }
    });
  };

  showForm = (type: string) => {
    const forms = document.querySelectorAll('.popup__form');
    forms.forEach((form) => {
      Object.assign((form as HTMLFormElement).style, {
        display: 'none',
      });
    });
    const activeForm = document.querySelector(`#${type}`);
    Object.assign((activeForm as HTMLFormElement).style, {
      display: 'block',
    });
  };
}
