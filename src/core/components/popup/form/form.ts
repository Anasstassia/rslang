import { content } from '../../types';
import html from './form.html';
// import './form.scss';

export class Form implements content {
  type: string;

  constructor(type: 'auth' | 'registration') {
    this.type = type;
  }

  async render() {
    return html;
  }

  async run() {
    // this.addListeners();
  }

  // addListeners = () => {
  //   const [tabRegister, tabAuth] = document.querySelectorAll<HTMLElement>('.tab');
  //   [tabRegister, tabAuth].forEach((el) =>
  //     el.addEventListener('click', () => {
  //       console.log(1);
  //     })
  //   );
  // };
}
