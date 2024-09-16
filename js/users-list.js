import { createPaymentMethodsList, hideElement } from './utils.js';
import { initiateMap } from './users-map.js';
import { modalBuyWindow, modalSellWindow, giveButtonsEventListener, deleteEventListenerFromButtons } from './modal.js';


const contractorsContainer = document.querySelector('.users-list');
const contractorsListTable = contractorsContainer.querySelector('.users-list__table-body');
const mapContainer = document.querySelector('.map').parentElement;
const tabControlButtons = document.querySelectorAll('.tabs__control');
const isVerifiedCheckbox = document.querySelector('#checked-users');
const userName = document.querySelector('.user-profile__name span');
const userCryptoBalance = document.querySelector('#user-crypto-balance');
const userCurrencyBalance = document.querySelector('#user-fiat-balance');

const buyListControlButton = tabControlButtons[0];
const sellListControlButton = tabControlButtons[1];
const viewContractorsByListButton = tabControlButtons[2];
const viewContractorsByMapButton = tabControlButtons[3];

let buyersList;
let sellersList;
let currentRenderedList;

const getContractorsData = async () => {
  const contractorsData = await fetch('https://cryptostar.grading.htmlacademy.pro/contractors');
  return contractorsData.json();
};

const getUserProfile = async () => {
  const userProfile = await fetch('https://cryptostar.grading.htmlacademy.pro/user');
  return userProfile.json();
};

const clearContractorsTable = () => {
  contractorsListTable.innerHTML = '';
};

export const renderContractorTableRow = (contractor, exchangeType) => {
  const domParser = new DOMParser();
  const contractorRow = `
    <table>
      <tr class="users-list__table-row">
        <td class="users-list__table-cell users-list__table-name">
          ${contractor.isVerified ? '<svg width="20" height="20" aria-hidden="true"><use xlink:href="#icon-star"></use></svg>' : ''}
          <span>${contractor.userName}</span>
        </td>
        <td class="users-list__table-cell users-list__table-currency">keks</td>
        <td class="users-list__table-cell users-list__table-exchangerate">${contractor.exchangeRate}₽</td>
        <td class="users-list__table-cell users-list__table-cashlimit">${contractor.balance.amount}₽</td>
        <td class="users-list__table-cell users-list__table-payments">
          ${createPaymentMethodsList('users-list__badges-list')}
        </td>
        <td class="users-list__table-cell users-list__table-btn">
          <button class="btn btn--greenborder exchange-btn exchange-btn--${exchangeType}" type="button">Обменять</button>
        </td>
      </tr>
    </table>
  `;

  const parsedStringElement = domParser.parseFromString(contractorRow, 'text/html');

  return parsedStringElement.querySelector('tr');
};

const renderContractorsTableList = (contractorsList, exchangeType) => {
  clearContractorsTable();

  contractorsList.forEach((value) => {
    const renderedUser = renderContractorTableRow(value, exchangeType);
    contractorsListTable.append(renderedUser);
  });
};

const removeIsActiveClass = (element) => {
  element.classList.remove('is-active');
};

const addIsActiveClass = (element) => {
  element.classList.add('is-active');
};

const renderOnlyVerifiedUsers = (exchangeType) => {
  if (isVerifiedCheckbox.checked) {
    const onlyVerifiedContractors = [...currentRenderedList].filter((element) => element.isVerified);

    renderContractorsTableList(onlyVerifiedContractors, exchangeType);
  } else {
    renderContractorsTableList([...currentRenderedList], exchangeType);
  }
};

buyListControlButton.addEventListener('click', () => {
  removeIsActiveClass(sellListControlButton);
  addIsActiveClass(buyListControlButton);
  currentRenderedList = [...buyersList];
  renderOnlyVerifiedUsers('buyer');
  deleteEventListenerFromButtons('sell', () => modalSellWindow.removeAttribute('style'));
  giveButtonsEventListener('buy', () => modalBuyWindow.removeAttribute('style'));

});

sellListControlButton.addEventListener('click', () => {
  removeIsActiveClass(buyListControlButton);
  addIsActiveClass(sellListControlButton);
  currentRenderedList = [...sellersList];
  renderOnlyVerifiedUsers('seller');
  deleteEventListenerFromButtons('buy', () => modalBuyWindow.removeAttribute('style'));
  giveButtonsEventListener('sell', () => modalSellWindow.removeAttribute('style'));
});

isVerifiedCheckbox.addEventListener('change', renderOnlyVerifiedUsers);

viewContractorsByListButton.addEventListener('click', () => {
  removeIsActiveClass(viewContractorsByMapButton);
  addIsActiveClass(viewContractorsByListButton);
  hideElement(mapContainer);
  contractorsContainer.removeAttribute('style');
});

viewContractorsByMapButton.addEventListener('click', () => {
  removeIsActiveClass(viewContractorsByListButton);
  addIsActiveClass(viewContractorsByMapButton);
  hideElement(contractorsContainer);
  mapContainer.removeAttribute('style');
  initiateMap(sellersList.filter((contractor) => contractor.coords));
});

getContractorsData().then((usersData) => {
  const copyUsersData = [...usersData];

  buyersList = copyUsersData.filter((element) => element.status === 'buyer');
  sellersList = copyUsersData.filter((element) => element.status === 'seller');

  renderContractorsTableList(buyersList, 'buyer');
  giveButtonsEventListener('buy', () => modalBuyWindow.removeAttribute('style'));

  currentRenderedList = [...buyersList];

});

getUserProfile().then((userProfileData) => {
  userName.textContent = userProfileData.userName;
  userCryptoBalance.textContent = userProfileData.balances[1].amount;
  userCurrencyBalance.textContent = userProfileData.balances[0].amount;
});
