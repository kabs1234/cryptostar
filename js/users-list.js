import { createPaymentMethodsList, hideElement, removeIsActiveClass, addIsActiveClass, clearInnerHtml } from './utils.js';
import { initiateMap, replaceContractorMarkers } from './users-map.js';
import { giveButtonsEventListener, showModalWindow } from './modal.js';
import { getUserProfile, getContractorsData } from './requests.js';

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
let savedUserData;

export const renderContractorTableRow = (contractor) => {
  const domParser = new DOMParser();
  const exchangeType = contractor.status;
  const minCashLimit = exchangeType === 'seller' ? (contractor.minAmount * contractor.exchangeRate).toFixed(2) : contractor.minAmount;
  const maxCashLimit = exchangeType === 'seller' ? (contractor.balance.amount * contractor.exchangeRate).toFixed(2) : contractor.balance.amount;
  const paymentMethodsArray = exchangeType === 'seller' ? contractor.paymentMethods.map((element) => element.provider) : savedUserData.paymentMethods.map((element) => element.provider);

  const contractorRow = `
    <table>
      <tr class="users-list__table-row">
        <td class="users-list__table-cell users-list__table-name">
          ${contractor.isVerified ? '<svg width="20" height="20" aria-hidden="true"><use xlink:href="#icon-star"></use></svg>' : ''}
          <span>${contractor.userName}</span>
        </td>
        <td class="users-list__table-cell users-list__table-currency">keks</td>
        <td class="users-list__table-cell users-list__table-exchangerate">${contractor.exchangeRate} ₽</td>
        <td class="users-list__table-cell users-list__table-cashlimit">${minCashLimit} ₽ - ${maxCashLimit} ₽</td>
        <td class="users-list__table-cell users-list__table-payments">
          ${createPaymentMethodsList('users-list__badges-list', paymentMethodsArray)}
        </td>
        <td class="users-list__table-cell users-list__table-btn">
          <button class="btn btn--greenborder exchange-btn exchange-btn--${exchangeType}" data-exchange-button-id="${contractor.id}" type="button">Обменять</button>
        </td>
      </tr>
    </table>
  `;

  const parsedStringElement = domParser.parseFromString(contractorRow, 'text/html');

  return parsedStringElement.querySelector('tr');
};

const renderContractorsTableList = (contractorsList) => {
  clearInnerHtml(contractorsListTable);

  contractorsList.forEach((value) => {
    const renderedUser = renderContractorTableRow(value);
    contractorsListTable.append(renderedUser);
  });
};

const renderOnlyVerifiedUsers = () => {
  const exchangeType = currentRenderedList[0].status;

  if (viewContractorsByListButton.classList.contains('is-active')) {
    if (isVerifiedCheckbox.checked) {
      const onlyVerifiedContractors = [...currentRenderedList].filter((element) => element.isVerified);

      renderContractorsTableList(onlyVerifiedContractors);
    } else {
      renderContractorsTableList([...currentRenderedList]);
    }
  } else if (viewContractorsByMapButton.classList.contains('is-active')) {
    if (isVerifiedCheckbox.checked) {
      replaceContractorMarkers([...currentRenderedList].filter((element) => element.coords && element.isVerified));
    } else {
      replaceContractorMarkers([...currentRenderedList].filter((element) => element.coords));
    }
  }

  giveButtonsEventListener(exchangeType.slice(0, exchangeType.length - 2), (evt) => showModalWindow(currentRenderedList, evt.target, savedUserData));
};

isVerifiedCheckbox.disabled = true;

getUserProfile().then((userProfileData) => {
  try {
    savedUserData = {...userProfileData};

    userName.textContent = userProfileData.userName;
    userCryptoBalance.textContent = userProfileData.balances[1].amount;
    userCurrencyBalance.textContent = userProfileData.balances[0].amount;
  } catch (err) {
    console.log(err);
  }
});

getContractorsData().then((contractorsData) => {
  try {
    buyersList = contractorsData.filter((element) => element.status === 'buyer');
    sellersList = contractorsData.filter((element) => element.status === 'seller');

    isVerifiedCheckbox.disabled = false;
    renderContractorsTableList(sellersList, 'seller');
    giveButtonsEventListener('sell', (evt) => showModalWindow(sellersList, evt.target, savedUserData));
    currentRenderedList = [...sellersList];

    buyListControlButton.addEventListener('click', () => {
      removeIsActiveClass(sellListControlButton);
      addIsActiveClass(buyListControlButton);
      currentRenderedList = [...sellersList];
      renderOnlyVerifiedUsers('seller');
      giveButtonsEventListener('sell', (evt) => showModalWindow(currentRenderedList, evt.target, savedUserData));
    });

    sellListControlButton.addEventListener('click', () => {
      removeIsActiveClass(buyListControlButton);
      addIsActiveClass(sellListControlButton);
      currentRenderedList = [...buyersList];
      renderOnlyVerifiedUsers('buyer');
      giveButtonsEventListener('buy', (evt) => showModalWindow(currentRenderedList, evt.target, savedUserData));
    });

    isVerifiedCheckbox.addEventListener('change', () => renderOnlyVerifiedUsers());

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
      initiateMap(sellersList.filter((contractor) => contractor.coords), savedUserData);
    });
  } catch (err) {
    console.log('error occured');
  }
});
