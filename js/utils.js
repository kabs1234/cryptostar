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

export const changeInputValue = (inputElement, customValue) => {
  inputElement.value = customValue;
};

export const createElementFromString = (string) => {
  const domParser = new DOMParser();

  const parsedString = domParser.parseFromString(string, 'text/html');
  return parsedString.body.firstChild;
};

export const showServerError = () => {
  const documentMainElement = document.querySelector('main');
  const serverErrorString = `
    <div class="container">
      <div class="message"><span class="message__icon">
          <svg width="60" height="60" aria-hidden="true">
            <use xlink:href="#icon-server-error"></use>
          </svg></span>
        <p class="message__paragraph">Сервер временно недоступен, попробуйте
          <a class="link">обновить страницу</a>
        </p>
      </div>
    </div>`;
  const headingElement = document.createElement('h1');
  const errorElement = createElementFromString(serverErrorString);
  const refreshPageLink = errorElement.querySelector('.link');

  clearInnerHtml(documentMainElement);
  headingElement.classList.add('visually-hidden');
  headingElement.textContent = 'Пользователи биржи';

  documentMainElement.append(headingElement);
  documentMainElement.append(errorElement);

  refreshPageLink.addEventListener('click', () => location.reload());
};

export const showNoResultError = () => {
  const documentMainElement = document.querySelector('main');
  const noResultsString = `
  <div class="container container--lightbackground">
    <div class="message message--noresults"><span class="message__icon">
        <svg width="60" height="60" aria-hidden="true">
          <use xlink:href="#icon-no-results"></use>
        </svg></span>
      <p class="message__paragraph">Нет подходящих объявлений
        <a class="link"></a>
      </p>
    </div>
  </div>`;
  const errorElement = createElementFromString(noResultsString);

  documentMainElement.append(errorElement);
};
