import { content } from '../../core/components/types';
import html from './main.html';
import './main.scss';

export class Main implements content {
  async render() {
    return html;
  }

  async run() {
    return undefined;
  }
}
