import { content } from '../types';
import html from './footer.html';
import './footer.scss';

export class Footer implements content {
  // constructor() {}

  async render() {
    return html;
  }

  async run() {
    return undefined;
  }
}
