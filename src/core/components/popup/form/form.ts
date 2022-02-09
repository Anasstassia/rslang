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
    return undefined;
  }
}
