import { content } from '../../core/components/types';
import html from './vocab.html';
import './vocab.scss';

export class Vocab implements content {
  async render() {
    return html;
  }

  async run() {
    return undefined;
  }
}
