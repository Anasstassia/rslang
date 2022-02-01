import { content } from '../types';
import html from './menu.html';
import './menu.scss';

export class Menu implements content {
  // constructor() {}

  async render() {
    return html;
  }

  async run() {
    return undefined;
  }
}
