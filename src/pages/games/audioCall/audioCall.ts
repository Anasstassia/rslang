import { content } from '../../../core/components/types';
import html from './audioCall.html';
import './audioCall.scss';

export class AudioCall implements content {
  async render() {
    return html;
  }

  async run() {
    return undefined;
  }
}
