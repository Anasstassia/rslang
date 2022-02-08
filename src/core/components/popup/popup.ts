import { createUser, loginUser, logOut } from '../../client/users';
import { content } from '../types';
// import { Form } from './form/form';
import html from './popup.html';
import './popup.scss';

type callbackType = (_e: Event) => void;

const withPreventDefault = (fn: callbackType) => (e: Event) => {
  e.preventDefault();
  return fn(e);
};

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

    const registerButton = document.querySelector('#form-registr .popup__btn');
    const loginButton = document.querySelector('#form-auth .popup__btn');
    const handlers = [createUser, loginUser];
    const ids = ['form-registr', 'form-auth'];
    const emailRegExp = /[a-z0-9]+@[a-z]+.[a-z]{2,3}/;

    [registerButton, loginButton].forEach((button, i) =>
      button?.addEventListener(
        'click',
        withPreventDefault((e) => {
          const event = e as MouseEvent;
          const target = e.target as HTMLElement;
          const x = event.clientX;
          const y = event.clientY;
          const buttonTop = target?.offsetTop;
          const buttonLeft = target?.offsetLeft;
          const emailInputElement = document.getElementById(ids[i])?.querySelector<HTMLInputElement>('.input__email');
          const passwordInputElement = document
            .getElementById(ids[i])
            ?.querySelector<HTMLInputElement>('.input__password');
          const spanEmail = document.getElementById(ids[i])?.querySelector('.spanEmail');
          const spanPass = document.getElementById(ids[i])?.querySelector('.spanPassword');

          const emailPasswordElement = document
            .getElementById(ids[i])
            ?.querySelector<HTMLInputElement>('.input__password');
          const xInside = x - buttonLeft;
          const yInside = y - buttonTop;
          const circle = document.createElement('span');
          circle.classList.add('circle');
          circle.style.top = `${yInside}px`;
          circle.style.left = `${xInside}px`;
          button.appendChild(circle);
          console.log(passwordInputElement?.value);
          if (!emailInputElement || !spanEmail || !passwordInputElement || !spanPass) return;
          if (!this.validate(emailRegExp, emailInputElement?.value)) {
            this.notValid(emailInputElement, spanEmail, 'Проверка почты не пройдена, введите еще раз');
          } else if (passwordInputElement?.value.length < 8) {
            this.notValid(
              passwordInputElement,
              spanPass,
              'Проверка пароля не пройдена, используйте минимум 8 символов'
            );
            this.valid(emailInputElement, spanEmail);
          } else {
            this.valid(emailInputElement, spanEmail);
            this.valid(passwordInputElement, spanPass);
            handlers[i]({ email: emailInputElement?.value || '', password: emailPasswordElement?.value || '' });
          }
          setTimeout(() => circle.remove(), 500);
        })
      )
    );

    const logOutButton = document.querySelector('.menu__link_logout');
    logOutButton?.addEventListener('click', withPreventDefault(logOut));
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

  validate(regex: RegExp, value: string) {
    return regex.test(value);
  }

  notValid(input: HTMLInputElement, elem: Element, mess: string) {
    input.classList.add('is-invalid');
    Object.assign(elem, { innerHTML: mess });
  }

  valid(input: HTMLInputElement, elem: Element) {
    input.classList.remove('is-invalid');
    Object.assign(elem, { innerHTML: '' });
  }
}
