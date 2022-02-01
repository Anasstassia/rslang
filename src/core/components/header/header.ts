import { content } from '../types';
import html from './header.html';
import './header.scss';

export class Header implements content {
  // constructor() {}

  async render() {
    return html;
  }

  async run() {
    return undefined;
  }
}
