import { CENTRE_OF_MAP } from './constants.js';
import { createPaymentMethodsList } from './utils.js';

const mapWrapper = document.querySelector('.map');
const contractorsLayer = L.layerGroup();
const map = L.map(mapWrapper);

const renderContractorPopup = (contractor) => {
  const domParser = new DOMParser();

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
        <span class="user-card__cash-data">${Math.floor(contractor.exchangeRate * Math.floor(contractor.balance.amount))} ₽</span>
      </p>
      ${createPaymentMethodsList('user-card__badges-list')}
      <button class="btn btn--green user-card__change-btn exchange-btn" type="button">Обменять</button>
    </div>
  `;
  const parsedStringElement = domParser.parseFromString(contractorPopup, 'text/html');

  return parsedStringElement.querySelector('div');
};

const addContractorMarker = (contractorData) => {
  const contractorMarker = L.marker([contractorData.coords.lat, contractorData.coords.lng]);
  const contractorPopup = renderContractorPopup(contractorData);
  contractorMarker.bindPopup(contractorPopup).openPopup();
  contractorsLayer.addLayer(contractorMarker);
};

const addContractorsMarkers = (contractorsData) => {
  contractorsData.forEach((contractor) => addContractorMarker(contractor));
  contractorsLayer.addTo(map);
};

export const initiateMap = (contractorsData) => {
  map.setView(CENTRE_OF_MAP, 13);
  const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  tileLayer.addTo(map);
  addContractorsMarkers(contractorsData);
};

