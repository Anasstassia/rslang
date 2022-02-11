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
