import { hideElement, removeAttributeFromElement } from './utils.js';

export const modalBuyWindow = document.querySelector('.modal--buy');
export const modalSellWindow = document.querySelector('.modal--sell');
const modalWindowOverlay = document.querySelector('.modal__overlay');
const buyModalCloseButton = document.querySelector('.modal__close-btn--buy');
const sellModalCloseButton = document.querySelector('.modal__close-btn--sell');
const modalWindowMessages = document.querySelectorAll('.modal__validation-message');
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

const convertCryptoToCurrency = (evt, exchangeRate, enrollmentElement) => {
  enrollmentElement.value = (+evt.target.value / exchangeRate).toFixed(5);
};

const converCurrencyToCrypto = (evt, exchangeRate, paymentElement) => {
  paymentElement.value = (+evt.target.value * exchangeRate).toFixed(5);
};


export const showContractorsData = (modalWindow, allContractorsData, contractorExchangeButton) => {
  const contractorData = allContractorsData.filter((contractor) => contractor.id === contractorExchangeButton.dataset.exchangeButtonId)[0];

  const userName = modalWindow.querySelector('.transaction-info__username');
  const exchangeRate = modalWindow.querySelector('.transaction-info__item--exchangerate .transaction-info__data');
  const cashLimit = modalWindow.querySelector('.transaction-info__item--cashlimit .transaction-info__data');
  const verifiedIcon = modalWindow.querySelector('.transaction-info__verified-icon');
  const paymentInput = modalWindow.querySelector('.custom-input__payment');
  const enrollmentInput = modalWindow.querySelector('.custom-input__enrollment');

  const cashLimitNumber = modalWindow === modalBuyWindow ? Math.floor(Math.floor(contractorData.balance.amount) * contractorData.exchangeRate) : contractorData.balance.amount;

  if (modalWindow === modalBuyWindow) {
    paymentInput.addEventListener('input', (evt) => convertCryptoToCurrency(evt, contractorData.exchangeRate, enrollmentInput));
    enrollmentInput.addEventListener('input', (evt) => converCurrencyToCrypto(evt, contractorData.exchangeRate, paymentInput));
  } else if (modalWindow === modalSellWindow) {
    paymentInput.addEventListener('input', (evt) => converCurrencyToCrypto(evt, contractorData.exchangeRate, enrollmentInput));
    enrollmentInput.addEventListener('input', (evt) => convertCryptoToCurrency(evt, contractorData.exchangeRate, paymentInput));
  }

  if (contractorData.isVerified) {
    verifiedIcon.removeAttribute('style');
  } else {
    hideElement(verifiedIcon);
  }


  userName.textContent = contractorData.userName;
  exchangeRate.textContent = `${contractorData.exchangeRate} ₽`;
  cashLimit.textContent = `${cashLimitNumber} ₽`;
};

export const showModalWindow = (modalWindow, allContractorsData, contractorExchangeButton) => {
  removeAttributeFromElement(modalWindow, 'style');
  showContractorsData(modalWindow, allContractorsData, contractorExchangeButton);

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
