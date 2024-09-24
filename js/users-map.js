import { CENTRE_OF_MAP } from './constants.js';
import { showModalWindow } from './modal.js';
import { createPaymentMethodsList } from './utils.js';

const mapWrapper = document.querySelector('.map');
const contractorsLayer = L.layerGroup();
const map = L.map(mapWrapper);

let savedContractorsData;
let savedUserData;

const renderContractorPopup = (contractor) => {
  const domParser = new DOMParser();
  const paymentMethodsArray = contractor.paymentMethods.map((element) => element.provider);
  const minCashLimit = Math.floor(Math.floor(contractor.minAmount) * contractor.exchangeRate);
  const maxCashLimit = Math.floor(Math.floor(contractor.balance.amount) * contractor.exchangeRate);


  const contractorPopup = `
    <div class="user-card">
      <span class="user-card__user-name" style="width: 100%;">
        ${contractor.isVerified ? '<svg width="20" height="20" aria-hidden="true"><use xlink:href="#icon-star"></use></svg>' : ''}
        <span>${contractor.userName}</span>
      </span>
      <p class="user-card__cash-item">
        <span class="user-card__cash-label">Валюта</span>
        <span class="user-card__cash-data">KEKS</span>
      </p>
      <p class="user-card__cash-item">
        <span class="user-card__cash-label">Курс</span>
        <span class="user-card__cash-data">${contractor.exchangeRate} ₽</span>
      </p>
      <p class="user-card__cash-item">
        <span class="user-card__cash-label">Лимит</span>
        <span class="user-card__cash-data">${minCashLimit} ₽ - ${maxCashLimit} ₽</span>
      </p>
      ${createPaymentMethodsList('user-card__badges-list', paymentMethodsArray)}
      <button class="btn btn--green user-card__change-btn exchange-btn exchange-btn--seller" data-exchange-button-id="${contractor.id}" type="button">Обменять</button>
    </div>
  `;
  const parsedStringElement = domParser.parseFromString(contractorPopup, 'text/html');

  return parsedStringElement.querySelector('div');
};

const addContractorMarker = (contractorData) => {
  const markerIcon = L.icon({
    iconUrl: contractorData.isVerified ? '../img/pin-verified.svg' : '../img/pin.svg',

    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -46],
  });

  const contractorMarker = L.marker([contractorData.coords.lat, contractorData.coords.lng], {icon: markerIcon});
  const contractorPopup = renderContractorPopup(contractorData);
  contractorMarker.bindPopup(contractorPopup).openPopup();
  contractorsLayer.addLayer(contractorMarker);
};

const addContractorsMarkers = (contractorsData) => {
  contractorsData.forEach((contractor) => addContractorMarker(contractor));
  contractorsLayer.addTo(map);
};

const clearLayer = (layer) => {
  layer.clearLayers();
};

export const replaceContractorMarkers = (replacingContactors) => {
  clearLayer(contractorsLayer);
  addContractorsMarkers(replacingContactors);
};

const exchangeButtonHandler = function (evt) {
  if (evt.popup) {
    const exchangeButton = evt.popup._wrapper.querySelector('.exchange-btn--seller');
    exchangeButton.addEventListener('click', (event) => showModalWindow(savedContractorsData, event.target, savedUserData));
  }
};

export const initiateMap = (contractorsData, userData) => {
  savedContractorsData = [...contractorsData];
  savedUserData = {...userData};

  map.setView(CENTRE_OF_MAP, 13);
  const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  tileLayer.addTo(map);
  addContractorsMarkers(savedContractorsData);
};


map.addEventListener('popupopen', exchangeButtonHandler);


