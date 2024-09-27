import { createPaymentMethodsList, hideElement, removeHtmlClass, addHtmlClass, clearInnerHtml} from './utils.js';
import { initiateMap, replaceContractorMarkers } from './users-map.js';
import { giveButtonsEventListener, showModalWindow } from './modal.js';
import { getUserProfile, getContractorsData } from './api.js';

const contractorsContainer = document.querySelector('.users-list');
const contractorsListTable = contractorsContainer.querySelector('.users-list__table-body');
const mapContainer = document.querySelector('.map').parentElement;
const tabControlButtons = document.querySelectorAll('.tabs__control');
const isVerifiedCheckbox = document.querySelector('#checked-users');
const userName = document.querySelector('.user-profile__name span');
const userCryptoBalance = document.querySelector('#user-crypto-balance');
const userCurrencyBalance = document.querySelector('#user-fiat-balance');

const buyCryptoListButton = tabControlButtons[0];
const sellCryptoListButton = tabControlButtons[1];
const viewContractorsByListButton = tabControlButtons[2];
const viewContractorsByMapButton = tabControlButtons[3];

let buyersList;
let sellersList;
let currentRenderedList;
let savedUserData;
let checkMapInitialization;

export const renderContractorTableRow = (contractor) => {
  const domParser = new DOMParser();
  const contractorExchangeType = contractor.status;
  const minCashLimit = contractorExchangeType === 'seller' ? +(contractor.minAmount * contractor.exchangeRate).toFixed(2) : contractor.minAmount;
  const maxCashLimit = contractorExchangeType === 'seller' ? +(contractor.balance.amount * contractor.exchangeRate).toFixed(2) : contractor.balance.amount;
  const paymentMethodsArray = contractorExchangeType === 'seller' ? contractor.paymentMethods.map((element) => element.provider) : savedUserData.paymentMethods.map((element) => element.provider);

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
          <button class="btn btn--greenborder exchange-btn exchange-btn--${contractorExchangeType}" data-exchange-button-id="${contractor.id}" type="button">Обменять</button>
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

const showUserData = (userData) => {
  userName.textContent = userData.userName;
  userCryptoBalance.textContent = userData.balances[1].amount;
  userCurrencyBalance.textContent = userData.balances[0].amount;
};

isVerifiedCheckbox.disabled = true;

getUserProfile().then((userProfileData) => {
  try {
    savedUserData = {...userProfileData};

    showUserData(savedUserData);
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

    buyCryptoListButton.addEventListener('click', () => {
      removeHtmlClass(sellCryptoListButton, 'is-active');
      addHtmlClass(buyCryptoListButton, 'is-active');
      currentRenderedList = [...sellersList];
      renderOnlyVerifiedUsers();
      giveButtonsEventListener('sell', (evt) => showModalWindow(currentRenderedList, evt.target, savedUserData));
    });

    sellCryptoListButton.addEventListener('click', () => {
      removeHtmlClass(buyCryptoListButton, 'is-active');
      addHtmlClass(sellCryptoListButton, 'is-active');
      currentRenderedList = [...buyersList];
      renderOnlyVerifiedUsers();
      giveButtonsEventListener('buy', (evt) => showModalWindow(currentRenderedList, evt.target, savedUserData));
    });

    isVerifiedCheckbox.addEventListener('change', () => renderOnlyVerifiedUsers());

    viewContractorsByListButton.addEventListener('click', () => {
      removeHtmlClass(viewContractorsByMapButton, 'is-active');
      addHtmlClass(viewContractorsByListButton, 'is-active');
      hideElement(mapContainer);
      contractorsContainer.removeAttribute('style');
      renderOnlyVerifiedUsers();
    });

    viewContractorsByMapButton.addEventListener('click', () => {
      removeHtmlClass(viewContractorsByListButton, 'is-active');
      addHtmlClass(viewContractorsByMapButton, 'is-active');
      hideElement(contractorsContainer);
      mapContainer.removeAttribute('style');
      if (!checkMapInitialization) {
        initiateMap([...currentRenderedList.filter((element) => element.coords)], savedUserData);
        checkMapInitialization = true;
      }
      renderOnlyVerifiedUsers();
    });
  } catch (err) {
    console.log('error occured');
  }
});
