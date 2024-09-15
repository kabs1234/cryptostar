import { PAYMENT_METHODS } from './constants.js';

export const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const getRandomElement = (array) => array[getRandomNumber(0, array.length - 1)];

export const generatePaymentMethods = () => {
  const paymentMethodsQuantity = getRandomNumber(1, PAYMENT_METHODS.length);
  const paymentMethodsCopy = [...PAYMENT_METHODS];
  const paymentMethodsArray = [];

  for (let i = 0; i < paymentMethodsQuantity; i++) {
    const randomPaymentMethod = getRandomElement(paymentMethodsCopy);
    const selectedPaymentMethodIndex = paymentMethodsCopy.indexOf(randomPaymentMethod);

    paymentMethodsArray.push(randomPaymentMethod);
    paymentMethodsCopy.splice(selectedPaymentMethodIndex, 1);
  }

  return paymentMethodsArray;
};

export const createPaymentMethodsList = (listClass) => {
  const paymentMethodsStrings = generatePaymentMethods().map((element) => `<li class="users-list__badges-item badge">${element}</li>`);

  return `<ul class="${listClass}">${paymentMethodsStrings.join('\n')}</ul>`;
};
