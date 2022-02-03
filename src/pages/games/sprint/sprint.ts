import { content } from '../../../core/components/types';
import html from './sprint.html';
import './sprint.scss';

export class SprintGame implements content {
  isSoundOn = false;

  async render() {
    return html;
  }

  async run() {
    this.addListeners();
  }

  addListeners() {
    const path = '../../../assets/icons';

    // toggle sound
    const soundBtn = document.getElementById('sprintSound') as HTMLImageElement;
    soundBtn.addEventListener('click', () => {
      this.isSoundOn = !this.isSoundOn;

      if (this.isSoundOn) {
        soundBtn.src = `${path}/soundOn.svg`;
      } else {
        soundBtn.src = `${path}/soundOff.svg`;
      }
    });

    // toggle fullscreen
    const fullscreenBtn = document.getElementById('sprintFullscreen') as HTMLImageElement;
    fullscreenBtn.addEventListener('click', () => {
      const sprintContent = document.querySelector('.sprint__content') as HTMLElement;

      if (!document.fullscreenElement) {
        document
          .querySelector('.sprint')
          ?.requestFullscreen()
          .catch((err) => {
            console.log(err.message);
          });

        sprintContent.style.marginTop = `calc(50% - ${sprintContent.clientHeight}px)`;

        fullscreenBtn.src = `${path}/fullscreenOff.svg`;
      } else {
        document.exitFullscreen();
        fullscreenBtn.src = `${path}/fullscreenOn.svg`;
        sprintContent.style.marginTop = '';
      }
    });
  }
}
