import './scss/style.scss';

import { Main } from './pages/main';
import { Vocab } from './pages/vocab';
import { Error404 } from './pages/error404';

import { Header } from './core/components/header';
import { Footer } from './core/components/footer';
import { Menu } from './core/components/menu';

import { Utils, urlRequest } from './core/utils/utils';
// import Types

export const header = new Header();
export const footer = new Footer();
export const menu = new Menu();
export const main = new Main();
export const vocab = new Vocab();
export const error404 = new Error404();

interface content {
  render: Function;
  run: Function;
}

const routes: Record<string, any> = {
  '/': main,
  '/vocab': vocab,
};

export const router = async () => {
  let headerElem = document.querySelector('.header') as HTMLElement;
  let mainElem = document.querySelector('.content') as HTMLElement;
  let footerElem = document.querySelector('.footer') as HTMLElement;
  let menuElem = document.querySelector('.menu') as HTMLElement;

  headerElem.innerHTML = await header.render();
  footerElem.innerHTML = await footer.render();
  menuElem.innerHTML = await menu.render();
  await header.run();
  await menu.run();
  await footer.run();

  const request: urlRequest = Utils.parseRequestURL();
  const parsedURL: string = (request.main ? `/${request.main}` : '/') + (request.vocab ? `/${request.vocab}` : '');

  const page: content = routes[parsedURL] ? routes[parsedURL] : error404;
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
