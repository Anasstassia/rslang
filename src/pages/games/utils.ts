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
