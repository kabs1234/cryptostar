import { SERVER_MAIN_LINK, SERVER_CONTRACTORS_LINK, SERVER_USER_LINK } from './constants.js';
import { showNoResultError, showServerError } from './utils.js';

export const getContractorsData = async () => {
  try {
    const contractorsData = await fetch(SERVER_CONTRACTORS_LINK);

    if (contractorsData.ok) {
      return contractorsData.json();
    }

    throw new Error(`HTTP error! status: ${contractorsData.status}`);
  } catch (err) {
    showNoResultError();
  }
};

export const getUserProfile = async () => {
  try {
    const userProfile = await fetch(SERVER_USER_LINK);

    if (userProfile.ok) {
      return userProfile.json();
    }

    throw new Error(`HTTP error! status: ${userProfile.status}`);
  } catch (err) {
    showServerError();
  }
};

export const sendFormData = async (form) => fetch(SERVER_MAIN_LINK, {
  body: new FormData(form),
  method: 'post',
});
