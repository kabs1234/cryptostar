import { PAYMENT_METHODS } from './constants.js';
import { getRandomNumber, getRandomElement } from './utils.js';

const usersListTable = document.querySelector('.users-list__table-body');
const tabControlButtons = document.querySelectorAll('.tabs__control');

const buyListControlButton = tabControlButtons[0];
const sellListControlButton = tabControlButtons[1];
const listViewButton = tabControlButtons[2];
const mapViewButton = tabControlButtons[3];

let buyersList;
let sellersList;

const getUsersList = async () => {
  const usersList = await fetch('https://cryptostar.grading.htmlacademy.pro/contractors');
  return usersList.json();
};

const generatePaymentMethods = () => {
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

const createPaymentMethodsList = () => {
  const paymentMethodsStrings = generatePaymentMethods().map((element) => `<li class="users-list__badges-item badge">${element}</li>`);

  return `<ul class="users-list__badges-list">${paymentMethodsStrings.join('\n')}</ul>`;
};

const renderUser = (user) => {
  const domParser = new DOMParser();
  const userRow = `
    <table>
      <tr class="users-list__table-row">
        <td class="users-list__table-cell users-list__table-name">
          ${user.isVerified ? '<svg width="20" height="20" aria-hidden="true"><use xlink:href="#icon-star"></use></svg>' : ''}
          <span>${user.userName}</span>
        </td>
        <td class="users-list__table-cell users-list__table-currency">keks</td>
        <td class="users-list__table-cell users-list__table-exchangerate">${user.exchangeRate}₽</td>
        <td class="users-list__table-cell users-list__table-cashlimit">${user.minAmount}₽</td>
        <td class="users-list__table-cell users-list__table-payments">
          ${createPaymentMethodsList()}
        </td>
        <td class="users-list__table-cell users-list__table-btn">
          <button class="btn btn--greenborder" type="button">Обменять</button>
        </td>
      </tr>
    </table>
  `;

  const parsedStringElement = domParser.parseFromString(userRow, 'text/html');

  return parsedStringElement.querySelector('tr');
};

const clearUsersListTable = () => {
  usersListTable.innerHTML = '';
};

const renderList = (usersList) => {
  clearUsersListTable();

  usersList.forEach((value) => {
    const renderedUser = renderUser(value);
    usersListTable.append(renderedUser);
  });
};

const removeIsActiveClass = (element) => {
  element.classList.remove('is-active');
};

const addIsActiveClass = (element) => {
  element.classList.add('is-active');
};

getUsersList().then((usersData) => {
  const copyUsersData = [...usersData];

  buyersList = copyUsersData.filter((element) => element.status === 'buyer');
  sellersList = copyUsersData.filter((element) => element.status === 'seller');

  renderList(buyersList);
});


buyListControlButton.addEventListener('click', () => {
  removeIsActiveClass(sellListControlButton);
  addIsActiveClass(buyListControlButton);
  renderList(buyersList);
});

sellListControlButton.addEventListener('click', () => {
  removeIsActiveClass(buyListControlButton);
  addIsActiveClass(sellListControlButton);
  renderList(sellersList);
});
