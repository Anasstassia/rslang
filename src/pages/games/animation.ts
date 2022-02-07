export const changeContent = (
  element: HTMLElement,
  time: number,
  width: number,
  height: number,
  padding: number,
  offset: Array<number>
) => {
  element.animate(
    [
      {
        width: `${width}px`,
        height: `${height}px`,
        padding: `${padding}px`,
        easing: 'ease-in-out',
      },
      {
        padding: `${padding}px 0`,
        offset: offset[0],
        easing: 'ease-in-out',
      },
      {
        width: '2px',
        offset: offset[1],
        easing: 'ease-in-out',
      },
      {
        width: '2px',
        offset: offset[2],
        easing: 'ease-in-out',
      },
      {
        padding: `${padding}px 0`,
        offset: offset[3],
        easing: 'ease-in-out',
      },
      {
        width: `${width}px`,
        height: `${height}px`,
        padding: `${padding}px`,
        easing: 'ease-in-out',
      },
    ],
    time
  );
};

export const appearanceContent = (element: HTMLElement, time: number) => {
  element.animate(
    [
      {
        opacity: 0,
        easing: 'ease-in-out',
      },
      {
        opacity: 0,
        offset: 0.9,
        easing: 'ease-in-out',
      },
      {
        opacity: 1,
        easing: 'ease-in-out',
      },
    ],
    time
  );
};

export const show = (element: HTMLElement, time: number, width: number, offset: number) => {
  element.animate(
    [
      {
        width: 0,
        easing: 'ease-in-out',
      },
      {
        width: 0,
        offset,
        easing: 'ease-in-out',
      },
      {
        width: `${width}px`,
        easing: 'ease-in-out',
      },
    ],
    time
  );
};

export const hide = (element: HTMLElement, time: number, width: number, offset: number) => {
  element.animate(
    [
      {
        width: `${width}px`,
        easing: 'ease-in-out',
      },
      {
        width: `${width}px`,
        offset,
        easing: 'ease-in-out',
      },
      {
        width: 0,
        easing: 'ease-in-out',
      },
    ],
    time
  );
};
