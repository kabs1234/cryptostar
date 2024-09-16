import { hideElement } from './utils.js';

export const modalBuyWindow = document.querySelector('.modal--buy');
export const modalSellWindow = document.querySelector('.modal--sell');
const modalWindowOverlay = document.querySelector('.modal__overlay');
const modalWindowMessages = document.querySelectorAll('.modal__validation-message');
const buyModalCloseButton = document.querySelector('.modal__close-btn--buy');
const sellModalCloseButton = document.querySelector('.modal__close-btn--sell');
let isModalWindowOpened = false;
let activeModalWindow;

let exchangeBuyButtons;
let exchangeSellButtons;

const closeModalOnEscape = (evt, activeModal) => {
  if (evt.key === 'Escape') {
    hideElement(activeModal);
  }
};

const keydownListener = (evt) => {
  if (activeModalWindow === 'buy') {
    closeModalOnEscape(evt, modalBuyWindow);
  } else if (activeModalWindow === 'sell') {
    closeModalOnEscape(evt, modalSellWindow);
  }
};

const onClickOutside = (evt, element) => {
  if (modalWindowOverlay.contains(evt.target)) {
    hideElement(element);
  }
};

const clickOutsideListener = (evt) => {
  if (activeModalWindow === 'buy') {
    onClickOutside(evt, modalBuyWindow);
  } else if (activeModalWindow === 'sell') {
    onClickOutside(evt, modalSellWindow);
  }
};


const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target === modalBuyWindow) {
      activeModalWindow = 'buy';
    } else if (mutation.target === modalSellWindow) {
      activeModalWindow = 'sell';
    }

    if (mutation.type === 'attributes' && isModalWindowOpened) {
      document.removeEventListener('keydown', keydownListener);
      document.removeEventListener('click', clickOutsideListener);
      isModalWindowOpened = false;
      document.body.classList.remove('scroll-lock');
    } else if (mutation.type === 'attributes' && !isModalWindowOpened) {
      document.addEventListener('keydown', keydownListener);
      document.addEventListener('click', clickOutsideListener);
      isModalWindowOpened = true;
      document.body.classList.add('scroll-lock');
    }
  });
});


export const giveButtonsEventListener = (buttonsType, cb) => {
  if (buttonsType === 'buy') {
    exchangeBuyButtons = document.querySelectorAll('.exchange-btn--buyer');
    exchangeBuyButtons.forEach((button) => button.addEventListener('click', cb));
  } else if (buttonsType === 'sell') {
    exchangeSellButtons = document.querySelectorAll('.exchange-btn--seller');
    exchangeSellButtons.forEach((button) => button.addEventListener('click', cb));
  }
};


export const deleteEventListenerFromButtons = (buttonsType, cb) => {
  if (buttonsType === 'buy') {
    exchangeBuyButtons.forEach((button) => button.removeEventListener('click', cb));
  } else if (buttonsType === 'sell') {
    exchangeSellButtons.forEach((button) => button.removeEventListener('click', cb));
  }
};

buyModalCloseButton.addEventListener('click', () => {
  modalBuyWindow.style = 'display: none;';
});

sellModalCloseButton.addEventListener('click', () => {
  modalSellWindow.style = 'display: none;';
});

observer.observe(modalBuyWindow, {
  attributes: true
});

observer.observe(modalSellWindow, {
  attributes: true
});

modalWindowMessages.forEach((element) => {
  element.style = 'display: none;';
});
