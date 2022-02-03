import { content } from '../../../core/components/types';
import html from './sprint.html';
import './sprint.scss';

export class SprintGame implements content {
  async render() {
    return html;
  }

  async run() {
    return undefined;
  }
}
