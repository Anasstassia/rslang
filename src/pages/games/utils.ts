import { changeContent, appearanceContent, hide } from './animation';
import { GameWord } from './sprint/sprint';

export function getRandomNum(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}

export async function getWords(group: string | undefined) {
  const randPage = getRandomNum(0, 30);

  const response = await (
    await fetch(`https://rs-lang-irina-mokh.herokuapp.com/words?group=${group}&page=${randPage}`)
  ).json();
  return response;
}

export function createWord(el: GameWord) {
  const word = document.createElement('div');
  word.classList.add('statistics__word');

  const div = document.createElement('div');

  const img = document.createElement('img');
  img.classList.add('statistics__word__audio');
  img.src = '../../../assets/icons/soundOn.svg';
  img.alt = 'Sound';

  img.addEventListener('click', () => {
    const audio = new Audio(`https://rs-lang-irina-mokh.herokuapp.com/${el.audio}`);
    audio.play();
  });

  const p1 = document.createElement('p');
  p1.innerHTML = el.word;

  const p2 = document.createElement('p');
  p2.classList.add('transcription');
  p2.innerHTML = el.transcription;

  const p3 = document.createElement('p');
  p3.classList.add('translate');
  p3.innerHTML = el.wordTranslate;

  div.append(img, p1);
  word.append(div, p2, p3);

  return word;
}

export function toggleHeaderBtns(isSoundOn: boolean) {
  const path = '../../../assets/icons';
  let soundState = isSoundOn;

  // toggle sound
  const soundBtn = document.getElementById('gameSound') as HTMLImageElement;
  soundBtn.addEventListener('click', () => {
    soundState = !soundState;
    soundBtn.src = soundState ? `${path}/soundOn.svg` : `${path}/soundOff.svg`;
    localStorage.setItem('sound', `${soundState}`);
  });

  // toggle fullscreen
  const fullscreenBtn = document.getElementById('gameFullscreen') as HTMLImageElement;
  fullscreenBtn.addEventListener('click', () => {
    const content = document.querySelector('.game__content') as HTMLElement;

    if (!document.fullscreenElement) {
      document.querySelector('.game')?.requestFullscreen();
      content.style.marginTop = '20vh';
      fullscreenBtn.src = `${path}/fullscreenOff.svg`;
    } else {
      document.exitFullscreen();
      fullscreenBtn.src = `${path}/fullscreenOn.svg`;
      content.style.marginTop = '';
    }
  });
}

export function checkLocalStarage() {
  const sound = localStorage.getItem('sound');
  const soundBtn = document.getElementById('gameSound') as HTMLImageElement;
  if (sound === 'false') {
    soundBtn.src = '../../../assets/icons/soundOff.svg';
  } else {
    soundBtn.src = '../../../assets/icons/soundOn.svg';
  }
}

export function generateStatisticsUI(game: 'sprint' | 'audio-call', startWidth: number) {
  const wrap = document.createElement('div');
  wrap.classList.add('statistics');

  const progress = document.createElement('p');
  progress.classList.add('statistics__progress');

  const correctNums = document.createElement('p');
  correctNums.classList.add('statistics__correct-num');

  const wrongWords = document.createElement('div');
  wrongWords.classList.add('statistics__mistakes');
  wrongWords.innerHTML = '<p>Не угадано:</p>';

  const correctWords = document.createElement('div');
  correctWords.classList.add('statistics__correctly');
  correctWords.innerHTML = '<p>Угадано:</p>';

  wrap.append(progress, correctNums, wrongWords, correctWords);

  const content = document.querySelector(`.${game}__content`) as HTMLElement;

  changeContent(content, 3000, startWidth, 300, 500, 300, 20, [0.05, 0.5, 0.7, 0.9]);
  appearanceContent(wrap, 3200);

  if (game === 'sprint') {
    const timer = document.querySelector('.timer') as HTMLElement;
    hide(timer, 1500, 600, 64, 0);
    setTimeout(() => {
      // timer.style.margin = '0';
      timer.remove();
    }, 1450);
  } else {
    const hearts = document.querySelector('.hearts') as HTMLElement;
    hide(hearts, 1500, 600, 64, 0);
    setTimeout(() => {
      hearts.remove();
    }, 1450);
  }

  content.innerHTML = '';
  content.appendChild(wrap);

  return { progress, correctNums, wrongWords, correctWords };
}

export function createEndBtns(game: 'sprint' | 'audio-call') {
  const btnsWrap = document.createElement('div');
  btnsWrap.classList.add('btns-wrap');

  const restart = document.createElement('button');
  restart.classList.add('restart');
  restart.innerHTML = 'Играть заново';

  const mainPage = document.createElement('button');
  mainPage.classList.add('main-page-btn');
  mainPage.innerHTML = 'Главная страница';

  mainPage.addEventListener('click', () => {
    window.location.href = '../';
  });

  btnsWrap.append(restart, mainPage);

  const wrap = document.querySelector(`.${game} .container`);
  wrap?.append(btnsWrap);
  return { restart, btnsWrap };
}
