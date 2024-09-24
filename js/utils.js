export const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const getRandomElement = (array) => array[getRandomNumber(0, array.length - 1)];

export const createPaymentMethodsList = (listClass, paymentMethods) => {
  const paymentMethodsStrings = paymentMethods.map((element) => `<li class="users-list__badges-item badge">${element}</li>`);

  return `<ul class="${listClass}">${paymentMethodsStrings.join('\n')}</ul>`;
};

export const createPaymentMethodsSelectMenu = (paymentMethods) => {
  const domParser = new DOMParser();

  const paymentMethodsOptionsStrings = paymentMethods.map((element) => `<option value="${element.provider}" data-payment-method="${element.provider}">${element.provider}</option>`);
  const paymentMethodsSelectMenu = `
    <select class="select-menu" name="paymentMethod" required>
      <option selected disabled>Выберите платёжную систему</option>
      ${paymentMethodsOptionsStrings.join('\n')}
    </select>
  `;

  const parsedSelectMenu = domParser.parseFromString(paymentMethodsSelectMenu, 'text/html');

  return parsedSelectMenu.body.firstChild;
};

export const hideElement = (element) => {
  element.style = 'display: none;';
};

export const removeIsActiveClass = (element) => {
  element.classList.remove('is-active');
};

export const addIsActiveClass = (element) => {
  element.classList.add('is-active');
};

export const clearInnerHtml = (element) => {
  element.innerHTML = '';
};
