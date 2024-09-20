import { createPaymentMethodsSelectMenu, hideElement } from './utils.js';

export const modalBuyWindow = document.querySelector('.modal--buy');
export const modalSellWindow = document.querySelector('.modal--sell');
const buyModalCloseButton = document.querySelector('.modal__close-btn--buy');
const sellModalCloseButton = document.querySelector('.modal__close-btn--sell');
const modalWindowMessages = document.querySelectorAll('.modal__validation-message');
let isModalWindowOpened = false;
let activeModalWindow;

let exchangeBuyButtons;
let modalWindowOverlay;
let exchangeSellButtons;
let contractor;
let user;

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
      resetModalForm(mutation.target);
    } else if (mutation.type === 'attributes' && !isModalWindowOpened) {
      document.addEventListener('keydown', keydownListener);
      document.addEventListener('click', clickOutsideListener);
      isModalWindowOpened = true;
      document.body.classList.add('scroll-lock');
    }
  });
});


const showContractorsData = (modalWindow) => {
  const userName = modalWindow.querySelector('.transaction-info__username');
  const exchangeRate = modalWindow.querySelector('.transaction-info__item--exchangerate .transaction-info__data');
  const cashLimit = modalWindow.querySelector('.transaction-info__item--cashlimit .transaction-info__data');
  const verifiedIcon = modalWindow.querySelector('.transaction-info__verified-icon');
  const minCashLimit = modalWindow === modalBuyWindow ? Math.floor(Math.floor(contractor.minAmount) * contractor.exchangeRate) : contractor.minAmount;
  const maxCashLimitNumber = modalWindow === modalBuyWindow ? Math.floor(Math.floor(contractor.balance.amount) * contractor.exchangeRate) : contractor.balance.amount;

  if (contractor.isVerified) {
    verifiedIcon.removeAttribute('style');
  } else {
    hideElement(verifiedIcon);
  }

  userName.textContent = contractor.userName;
  exchangeRate.textContent = `${contractor.exchangeRate} ₽`;
  cashLimit.textContent = `${minCashLimit} ₽ - ${maxCashLimitNumber} ₽`;
};

const checkSellCryptoConverting = (crypto) => {
  const convertedCryptoToCurrency = crypto * contractor.exchangeRate;

  if ( convertedCryptoToCurrency > contractor.minAmount && convertedCryptoToCurrency < contractor.balance.amount && crypto < user.balances[1].amount) {
    console.log(true);
  } else {
    console.log(false);
  }
};

const checkSellCurrencyConverting = (currency) => {
  const convertedCurrencyToCrypto = currency / contractor.exchangeRate;

  if ( currency > contractor.minAmount && currency < contractor.balance.amount && convertedCurrencyToCrypto < user.balances[1].amount) {
    console.log(true);
  } else {
    console.log(false);
  }
};

const checkBuyCurrencyConverting = (currency) => {
  const minCashLimit = contractor.minAmount * contractor.exchangeRate;
  const maxCashLimit = contractor.balance.amount * contractor.exchangeRate;

  if ( currency > minCashLimit && currency < maxCashLimit) {
    console.log(true);
  } else {
    console.log(false);
  }
};

const checkBuyCryptoConverting = (crypto) => {
  const convertedCryptoToCurrency = crypto * contractor.exchangeRate;
  const minCashLimit = contractor.minAmount * contractor.exchangeRate;
  const maxCashLimit = contractor.balance.amount * contractor.exchangeRate;

  if ( convertedCryptoToCurrency > minCashLimit && convertedCryptoToCurrency < maxCashLimit) {
    console.log(true);
  } else {
    console.log(false);
  }
};

const checkPassword = (password) => console.log(password === '180712');

const convertCurrencyToCrypto = (evt, enrollmentElement) => {
  enrollmentElement.value = (+evt.target.value / contractor.exchangeRate).toFixed(2);
};

const convertCryptoToCurrency = (evt, paymentElement) => {
  paymentElement.value = (+evt.target.value * contractor.exchangeRate).toFixed(2);
};

const exchangeAllCrypto = () => {
  const exchangedCryptoToCurrency = user.balances[1].amount * contractor.exchangeRate;

  return exchangedCryptoToCurrency.toFixed(2);
};

const exchangeAllCurrency = () => {
  const maxCashLimit = contractor.balance.amount;
  const exchangedCurrencyToCrypto = maxCashLimit / contractor.exchangeRate;

  return exchangedCurrencyToCrypto.toFixed(2);
};

const changeInputValue = (inputElement, customValue) => {
  inputElement.value = customValue;
};

const placeCardNumber = (evt, paymentMethods) => {
  const selectedPaymentMethodData = paymentMethods.filter((paymentMethod) => paymentMethod.provider === evt.target.value);
  const userCardNumber = selectedPaymentMethodData[0].accountNumber;

  return userCardNumber ?? '';
};

const replaceSelectMenus = (modalWindow, paymentMethods) => {
  const selectMenuWrapper = modalWindow.querySelector('.select');
  const paymentSystemsSelectMenu = modalWindow.querySelector('.select-menu');
  const newPaymentSystemsSelect = createPaymentMethodsSelectMenu(paymentMethods);
  selectMenuWrapper.replaceChild(newPaymentSystemsSelect, paymentSystemsSelectMenu);

  const cardNumberInput = modalWindow.querySelector('.custom-input__card-number');
  newPaymentSystemsSelect.addEventListener('change', (evt) => cardNumberInput.value = placeCardNumber(evt, paymentMethods));
};

const handleModalSellWindow = () => {
  const paymentInput = modalSellWindow.querySelector('.custom-input__payment');
  const enrollmentInput = modalSellWindow.querySelector('.custom-input__enrollment');
  const exchangeAllCryptoButton = modalSellWindow.querySelector('.custom-input__btn--exchange-crypto');
  const exchangeAllCurrencyButton = modalSellWindow.querySelector('.custom-input__btn--exchange-currency');
  const cryptoWalletInput = modalSellWindow.querySelector('.custom-input__crypto-wallet');
  const passwordInput = modalSellWindow.querySelector('.custom-input__password');
  const modalForm = modalSellWindow.querySelector('form');
  const pristineForm = new Pristine(modalForm);


  cryptoWalletInput.value = contractor.wallet.address;
  pristineForm.addValidator(paymentInput, checkSellCryptoConverting, 'check');
  pristineForm.addValidator(enrollmentInput, checkSellCurrencyConverting, 'check');
  pristineForm.addValidator(passwordInput, checkPassword, 'check')

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
};

const handleModalBuyWindow = () => {
  const paymentInput = modalBuyWindow.querySelector('.custom-input__payment');
  const enrollmentInput = modalBuyWindow.querySelector('.custom-input__enrollment');
  const exchangeAllCurrencyButton = modalBuyWindow.querySelector('.custom-input__btn--exchange-currency');
  const cryptoWalletInput = modalBuyWindow.querySelector('.custom-input__crypto-wallet');
  const passwordInput = modalBuyWindow.querySelector('.custom-input__password');
  const modalForm = modalBuyWindow.querySelector('form');
  const pristineForm = new Pristine(modalForm);



  cryptoWalletInput.value = user.wallet.address;
  pristineForm.addValidator(passwordInput, checkPassword, 'check')
  pristineForm.addValidator(paymentInput, checkBuyCurrencyConverting, 'check');
  pristineForm.addValidator(enrollmentInput, checkBuyCryptoConverting, 'check');

  paymentInput.addEventListener('input', (evt) => convertCurrencyToCrypto(evt, enrollmentInput));
  enrollmentInput.addEventListener('input', (evt) => convertCryptoToCurrency(evt, paymentInput));

  exchangeAllCurrencyButton.addEventListener('click', () => {
    changeInputValue(paymentInput, user.balances[0].amount);
    changeInputValue(enrollmentInput, exchangeAllCrypto(user, contractor));
  });
};

export const showModalWindow = (allContractorsData, contractorExchangeButton, userData) => {
  const contractorData = allContractorsData.filter((clickedContractor) => clickedContractor.id === contractorExchangeButton.dataset.exchangeButtonId)[0];
  contractor = contractorData;
  user = userData;

  if (contractor.status === 'seller') {
    modalWindowOverlay = modalBuyWindow.querySelector('.modal__overlay');
    modalBuyWindow.removeAttribute('style');
    replaceSelectMenus(modalBuyWindow, contractor.paymentMethods);
    showContractorsData(modalBuyWindow);
    handleModalBuyWindow();
  } else if (contractor.status === 'buyer') {
    modalWindowOverlay = modalSellWindow.querySelector('.modal__overlay');
    modalSellWindow.removeAttribute('style');
    replaceSelectMenus(modalSellWindow, user.paymentMethods);
    showContractorsData(modalSellWindow);
    handleModalSellWindow();
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
