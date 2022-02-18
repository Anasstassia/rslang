import './scss/style.scss';

import { Main } from './pages/main';
import { Vocab } from './pages/vocab';
import { SprintGame } from './pages/games/sprint';
import { AudioCall } from './pages/games/audioCall';
import { Error404 } from './pages/error404';
import { Popup } from './core/components/popup';
import { Stats } from './pages/stats';

import { Header } from './core/components/header';
import { Footer } from './core/components/footer';
import { Menu } from './core/components/menu';

import { Utils } from './core/utils/utils';
// import Types
import { content } from './core/components/types';
import { getCurrentUser, loginUser, state } from './core/client/users';

export const header = new Header();
export const footer = new Footer();
export const menu = new Menu();
export const main = new Main();
export const vocab = new Vocab();
export const sprint = new SprintGame();
export const audioCall = new AudioCall();
export const error404 = new Error404();
export const popup = new Popup();
export const stats = new Stats();

const routes: Record<string, content> = {
  '/': main,
  '/vocab': vocab,
  '/sprint': sprint,
  '/audio': audioCall,
  '/stats': stats,
};

export const router = async () => {
  // врменный способ создания статистики - удалить позже
  // await loginUser({ email: 'test-user@google.com', password: '12345678' });
  // для удаления userwords И очистки изученных в статистике
  // if (state.currentUser) {
  //   await Utils.resetData();
  // }

  const headerElem = document.querySelector('.header') as HTMLElement;
  const mainElem = document.querySelector('.content') as HTMLElement;
  const footerElem = document.querySelector('.footer') as HTMLElement;
  const menuElem = document.querySelector('.menu') as HTMLElement;
  const popupElem = document.querySelector('.popup') as HTMLElement;
  headerElem.innerHTML = await header.render();
  footerElem.innerHTML = await footer.render();
  menuElem.innerHTML = await menu.render();
  popupElem.innerHTML = await popup.render();
  await header.run();
  await menu.run();
  await footer.run();
  await popup.run();
  await getCurrentUser();
  if (state.currentUser?.id) {
    stats.id = state.currentUser?.id;
    await stats.update();
  }
  const request = Utils.parseRequestURL();
  const parsedURL =
    (request.main ? `/${request.main}` : '/') +
    (request.vocab ? `/${request.vocab}` : '') +
    (request.sprint ? `/${request.sprint}` : '') +
    (request.audio ? `/${request.audio}` : '') +
    (request.stats ? `/${request.stats}` : '');

  const page = routes[parsedURL] ? routes[parsedURL] : error404;
  mainElem.innerHTML = await page.render();
  await page.run();
  await renderAuthElements();

  /* Для логина можно использовать данный запрос:
   *
   * loginUser({ email: 'test-user@google.com', password: '12345678' });
   *
   */
};
export async function renderAuthElements() {
  // console.log(state);

  const authOnlyElems = document.querySelectorAll('.auth') as NodeListOf<HTMLElement>;
  authOnlyElems.forEach((elem: HTMLElement) => {
    elem.style.display = '';
    if (!state.currentUser) {
      elem.style.display = 'none';
    }
  });
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
