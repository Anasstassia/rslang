import './scss/style.scss';

import { Main } from './pages/main';
import { Vocab } from './pages/vocab';
import { Error404 } from './pages/error404';

import { Header } from './core/components/header';
import { Footer } from './core/components/footer';
import { Menu } from './core/components/menu';

import { Utils } from './core/utils/utils';
// import Types
import { content } from './core/components/types';

export const header = new Header();
export const footer = new Footer();
export const menu = new Menu();
export const main = new Main();
export const vocab = new Vocab();
export const error404 = new Error404();

const routes: Record<string, content> = {
  '/': main,
  '/vocab': vocab,
};

export const router = async () => {
  const headerElem = document.querySelector('.header') as HTMLElement;
  const mainElem = document.querySelector('.content') as HTMLElement;
  const footerElem = document.querySelector('.footer') as HTMLElement;
  const menuElem = document.querySelector('.menu') as HTMLElement;

  headerElem.innerHTML = await header.render();
  footerElem.innerHTML = await footer.render();
  menuElem.innerHTML = await menu.render();
  // await header.run();
  // await menu.run();
  // await footer.run();

  const request = Utils.parseRequestURL();
  const parsedURL = (request.main ? `/${request.main}` : '/') + (request.vocab ? `/${request.vocab}` : '');

  const page = routes[parsedURL] ? routes[parsedURL] : error404;
  mainElem.innerHTML = await page.render();
  await page.run();
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

/*
console.log(`
Самооценка: 
165	баллов
	
`)
*/
