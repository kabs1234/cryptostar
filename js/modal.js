import { SERVER_MAIN_LINK } from './constants.js';
import { createPaymentMethodsSelectMenu, hideElement } from './utils.js';

export const modalBuyWindow = document.querySelector('.modal--buy');
export const modalSellWindow = document.querySelector('.modal--sell');
const buyModalCloseButton = document.querySelector('.modal__close-btn--buy');
const sellModalCloseButton = document.querySelector('.modal__close-btn--sell');
const modalWindowMessages = document.querySelectorAll('.modal__validation-message');

let activeModalWindow;
let exchangeBuyButtons;
let modalWindowOverlay;
let exchangeSellButtons;
let contractor;
let user;
let isSellFormSet = false;
let isBuyFormSet = false;

const callFunctionOnActiveModal = (evt, activeModal, cb) => {
  if (activeModal === 'buy') {
    cb(evt, modalBuyWindow);
  } else if (activeModal === 'sell') {
    cb(evt, modalSellWindow);
  }
};

const closeModalOnEscape = (evt, activeModal) => {
  if (evt.key === 'Escape') {
    hideElement(activeModal);
  }
};

const onClickOutside = (evt, element) => {
  if (modalWindowOverlay.contains(evt.target)) {
    hideElement(element);
  }
};

const keydownListener = (evt) => {
  callFunctionOnActiveModal(evt, activeModalWindow, closeModalOnEscape);
};

const clickOutsideListener = (evt) => {
  callFunctionOnActiveModal(evt, activeModalWindow, onClickOutside);
};

const resetModalForm = (modalWindow) => {
  modalWindow.querySelector('form').reset();
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    modalWindowOverlay = mutation.target.querySelector('.modal__overlay');


    if (mutation.target === modalBuyWindow) {
      activeModalWindow = 'buy';
    } else if (mutation.target === modalSellWindow) {
      activeModalWindow = 'sell';
    }

    if (mutation.target.style.display === 'none') {
      document.removeEventListener('keydown', keydownListener);
      document.removeEventListener('click', clickOutsideListener);
      document.body.classList.remove('scroll-lock');
      resetModalForm(mutation.target);
    } else if (mutation.target.style.display === '' ) {
      document.addEventListener('keydown', keydownListener);
      document.addEventListener('click', clickOutsideListener);
      document.body.classList.add('scroll-lock');
    }
  });
});


const placeContractorsData = (modalWindow) => {
  const userName = modalWindow.querySelector('.transaction-info__username');
  const exchangeRate = modalWindow.querySelector('.transaction-info__item--exchangerate .transaction-info__data');
  const cashLimit = modalWindow.querySelector('.transaction-info__item--cashlimit .transaction-info__data');
  const verifiedIcon = modalWindow.querySelector('.transaction-info__verified-icon');
  const cryptoWalletInput = modalWindow.querySelector('.custom-input__crypto-wallet');
  const minCashLimit = modalWindow === modalBuyWindow ? contractor.minAmount * contractor.exchangeRate : contractor.minAmount;
  const maxCashLimitNumber = modalWindow === modalBuyWindow ? (contractor.balance.amount * contractor.exchangeRate) : contractor.balance.amount;


  if (contractor.isVerified) {
    verifiedIcon.removeAttribute('style');
  } else {
    hideElement(verifiedIcon);
  }

  cryptoWalletInput.value = modalWindow === modalBuyWindow ? user.wallet.address : contractor.wallet.address;
  userName.textContent = contractor.userName;
  exchangeRate.textContent = `${contractor.exchangeRate} ₽`;
  cashLimit.textContent = `${minCashLimit} ₽ - ${maxCashLimitNumber} ₽`;
};

const checkSellCryptoConverting = (crypto) => {
  const convertedCryptoToCurrency = +crypto * contractor.exchangeRate;

  return convertedCryptoToCurrency >= contractor.minAmount && convertedCryptoToCurrency <= contractor.balance.amount && crypto <= user.balances[1].amount;
};

const checkSellCurrencyConverting = (currency) => {
  const convertedCurrencyToCrypto = +currency / contractor.exchangeRate;

  return currency >= contractor.minAmount && currency <= contractor.balance.amount && convertedCurrencyToCrypto <= user.balances[1].amount;
};

const checkBuyCurrencyConverting = (currency) => {
  const minCashLimit = contractor.minAmount * contractor.exchangeRate;
  const maxCashLimit = contractor.balance.amount * contractor.exchangeRate;

  return +currency >= minCashLimit && +currency <= maxCashLimit;
};

const checkBuyCryptoConverting = (crypto) => {
  const convertedCryptoToCurrency = +crypto * contractor.exchangeRate;
  const minCashLimit = contractor.minAmount * contractor.exchangeRate;
  const maxCashLimit = contractor.balance.amount * contractor.exchangeRate;

  return convertedCryptoToCurrency >= minCashLimit && convertedCryptoToCurrency <= maxCashLimit;
};

const checkPassword = (password) => password === '180712';

const convertCurrencyToCrypto = (evt, enrollmentElement) => {
  enrollmentElement.value = (+evt.target.value / contractor.exchangeRate);
};

const convertCryptoToCurrency = (evt, paymentElement) => {
  paymentElement.value = (+evt.target.value * contractor.exchangeRate);
};

const exchangeAllCrypto = () => {
  const exchangedCryptoToCurrency = user.balances[1].amount * contractor.exchangeRate;

  return exchangedCryptoToCurrency;
};

const exchangeAllCurrency = () => {
  const maxCashLimit = contractor.balance.amount;
  const exchangedCurrencyToCrypto = maxCashLimit / contractor.exchangeRate;

  return exchangedCurrencyToCrypto;
};

const changeInputValue = (inputElement, customValue) => {
  inputElement.value = customValue;
};

const placeCardNumber = (evt, paymentMethods) => {
  const selectedPaymentMethodData = paymentMethods.filter((paymentMethod) => paymentMethod.provider === evt.target.value);
  const userCardNumber = selectedPaymentMethodData[0].accountNumber;

  return userCardNumber ? userCardNumber : '';
};

const replaceSelectMenus = (modalWindow, paymentMethods) => {
  const selectMenuWrapper = modalWindow.querySelector('.select');
  const paymentSystemsSelectMenu = modalWindow.querySelector('.select-menu');
  const cardNumberInput = modalWindow.querySelector('.custom-input__card-number');
  const newPaymentSystemsSelect = createPaymentMethodsSelectMenu(paymentMethods);

  selectMenuWrapper.replaceChild(newPaymentSystemsSelect, paymentSystemsSelectMenu);
  newPaymentSystemsSelect.addEventListener('change', (evt) => {
    cardNumberInput.value = placeCardNumber(evt, paymentMethods);
  });
};

const sendFormData = async (form) => {
  fetch(SERVER_MAIN_LINK, {
    body: new FormData(form),
    method: 'post',
  });
};

const setModalForm = (modalWindow) => {
  const paymentInput = modalWindow.querySelector('.custom-input__payment');
  const enrollmentInput = modalWindow.querySelector('.custom-input__enrollment');
  const exchangeAllCurrencyButton = modalWindow.querySelector('.custom-input__btn--exchange-currency');
  const passwordInput = modalWindow.querySelector('.custom-input__password');
  const modalForm = modalWindow.querySelector('form');
  const pristineForm = new Pristine(modalForm);

  if (modalWindow === modalBuyWindow) {
    pristineForm.addValidator(paymentInput, checkBuyCurrencyConverting, 'Введенная сумма должна быть в диапозоне лимита');
    pristineForm.addValidator(enrollmentInput, checkBuyCryptoConverting, 'check');

    paymentInput.addEventListener('input', (evt) => convertCurrencyToCrypto(evt, enrollmentInput));
    enrollmentInput.addEventListener('input', (evt) => convertCryptoToCurrency(evt, paymentInput));

    exchangeAllCurrencyButton.addEventListener('click', () => {
      changeInputValue(paymentInput, user.balances[0].amount);
      changeInputValue(enrollmentInput, exchangeAllCrypto(user, contractor));
    });
  } else if (modalWindow === modalSellWindow) {
    const exchangeAllCryptoButton = modalSellWindow.querySelector('.custom-input__btn--exchange-crypto');

    pristineForm.addValidator(paymentInput, checkSellCryptoConverting, 'check');
    pristineForm.addValidator(enrollmentInput, checkSellCurrencyConverting, 'check');

    paymentInput.addEventListener('input', (evt) => convertCryptoToCurrency(evt, enrollmentInput));
    enrollmentInput.addEventListener('input', (evt) => convertCurrencyToCrypto(evt, paymentInput));
    exchangeAllCryptoButton.addEventListener('click', () => {
      changeInputValue(paymentInput, user.balances[1].amount);
      changeInputValue(enrollmentInput, exchangeAllCrypto(user, contractor));
    });
    exchangeAllCurrencyButton.addEventListener('click', () => {
      changeInputValue(enrollmentInput, contractor.balance.amount);
      changeInputValue(paymentInput, exchangeAllCurrency(contractor));
    });
  }

  pristineForm.addValidator(passwordInput, checkPassword, 'check');

  modalForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    if (pristineForm.validate()) {
      const contractorId = modalWindow.querySelector('.modal-form__contractor-id');
      const exchangeRate = modalWindow.querySelector('.modal-form__exchange-rate');

      contractorId.value = contractor.id;
      exchangeRate.value = contractor.exchangeRate;

      sendFormData(modalForm);
    } else {
      console.log(2);
    }
  });
};

export const showModalWindow = (allContractorsData, contractorExchangeButton, userData) => {
  const contractorData = allContractorsData.filter((clickedContractor) => clickedContractor.id === contractorExchangeButton.dataset.exchangeButtonId)[0];
  contractor = contractorData;
  user = userData;

  if (contractor.status === 'seller') {
    modalBuyWindow.style = 'z-index: 1000;';
    replaceSelectMenus(modalBuyWindow, contractor.paymentMethods);
    placeContractorsData(modalBuyWindow);

    if (!isBuyFormSet) {
      setModalForm(modalBuyWindow);
      isBuyFormSet = true;
    }
  } else if (contractor.status === 'buyer') {
    modalSellWindow.style = 'z-index: 1000;';
    replaceSelectMenus(modalSellWindow, user.paymentMethods);
    placeContractorsData(modalSellWindow);

    if (!isSellFormSet) {
      setModalForm(modalSellWindow);
      isSellFormSet = true;
    }
  }

};

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
