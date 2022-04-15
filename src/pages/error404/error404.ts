import { content } from '../../core/components/types';
import html from './error404.html';

export class Error404 implements content {
  async render() {
    return html;
  }

  async after_render() {
    return undefined;
  }

  async run() {
    return undefined;
  }
}
