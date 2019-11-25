const logoElement = document.querySelector('#logo');
const dateElement = document.querySelector('input');
const errorElement = document.querySelector('#error');
const errorButtonElement = document.querySelector('#errorButton');
const errorMessageElement = document.querySelector('#errorMessage');
const birthdayLaunchesContainer = document.querySelector('#birthdayLaunches');
const allBirthdayLaunchesContainer = document.querySelector('#allBirthdayLaunches');
const allBirthdayLaunchesPagination = document.querySelector('#allBirthdayLaunchesPagination');
const prevPaginationButton = document.querySelector('#prevPaginationButton');
const nextPaginationButton = document.querySelector('#nextPaginationButton');

const firstPaginationButton = document.querySelector('#firstPaginationButton');
const lastPaginationButton = document.querySelector('#lastPaginationButton');

const allLaunchesSince = document.querySelector('#allLaunchesSince');
const paginationInfo = document.querySelector('#paginationInfo');

const API_URL = 'https://launchlibrary.net/1.3/launch/';
const FETCH_LIMIT = 20;

let launchResponse = {};

const getFormattedDate = (date) => {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
  .toISOString()
  .split("T")[0];
};

const makeRocketElement = ({ name, rocket: { imageURL }, vidURLs, infoURLs, failreason, net }) => {
  return `
  <div class="column is-4">
<div class="card" style="border-radius: 2rem;">
  <div class="card-image" style="padding-top: 1rem;">
    <img src="${imageURL}" style="max-height: 10rem;">
  </div>
  <div class="card-content">
    <p class="title is-size-4 has-text-black" style="margin-bottom: 0;">${name}</p>
    <small class="is-size-7 has-text-gray">${net}</small>
    <p class="subtitle is-size-6 has-text-black">${failreason ? 'Launch Unsuccessful' : 'Launch Successful'}</p>
    <small class="is-size-7 has-text-black">${failreason ? failreason : ''}</small>
  </div>
  <div class="card-footer">
    <a href="${vidURLs && vidURLs.length > 0 ? vidURLs[0] : ''}" class="card-footer-item ${!vidURLs || vidURLs.length <= 0 ? ' has-text-grey' : ''}" target="_blank" rel="noopener noreferrer">Watch</a>
    <a href="${infoURLs && infoURLs.length > 0 ? infoURLs[0] : ''}" class="card-footer-item ${!infoURLs || infoURLs.length <= 0 ? ' has-text-grey' : ''}" target="_blank" rel="noopener noreferrer">More info</a>
  </div>
</div></div>
`;
};

const makeRocketFetch = async (startDate, endDate, offset = 0) => {
  const response = await fetch(`${API_URL}${startDate}/${endDate}?limit=${FETCH_LIMIT}&offset=${offset}`);
  const data = await response.json();
  if (data.launches.length <= 0) throw new Error('No launches found for that date.');
  return {
    ...data,
    startDate,
    endDate,
  };
};

const updatePaginationButtons = () => {
  const upperLimit = launchResponse.count < FETCH_LIMIT ? launchResponse.count : FETCH_LIMIT;
  paginationInfo.textContent = `Showing: ${launchResponse.offset}-${launchResponse.offset + upperLimit}/${launchResponse.total}`;

  if (launchResponse.offset === 0) firstPaginationButton.setAttribute('disabled', true);
  else firstPaginationButton.removeAttribute('disabled');

  if (launchResponse.offset === 0) prevPaginationButton.setAttribute('disabled', true);
  else prevPaginationButton.removeAttribute('disabled');

  if (launchResponse.count < FETCH_LIMIT) nextPaginationButton.setAttribute('disabled', true);
  else nextPaginationButton.removeAttribute('disabled');

  if (launchResponse.count < FETCH_LIMIT) lastPaginationButton.setAttribute('disabled', true);
  else lastPaginationButton.removeAttribute('disabled');
};

const handlePaginationButton = async (direction) => {
  try {
    const { startDate, endDate, offset, total } = launchResponse;
    const lastPage = (Math.floor(total/FETCH_LIMIT) * FETCH_LIMIT);

    let data;
    switch (direction) {
      case 'first':
        if (firstPaginationButton.getAttribute('disabled')) return;
        data = await makeRocketFetch(startDate, endDate, 0);
        break;
      case 'prev':
        if (prevPaginationButton.getAttribute('disabled')) return;
        data = await makeRocketFetch(startDate, endDate, offset - FETCH_LIMIT);
        break;
      case 'next':
        if (nextPaginationButton.getAttribute('disabled')) return;
        data = await makeRocketFetch(startDate, endDate, offset + FETCH_LIMIT);
        break;
      case 'last':
        if (lastPaginationButton.getAttribute('disabled')) return;
        data = await makeRocketFetch(startDate, endDate, lastPage);
        break;
      default:
        break;
    }
    launchResponse = { ...data };
    updatePaginationButtons();
    updateDisplayedRockets();
  } catch (error) {
    errorElement.classList.toggle('hidden', false);
    errorMessageElement.textContent = error.message;
  }
};

const updateDisplayedRockets = () => {
  let rocketsString = '';
  launchResponse.launches.forEach((launch) => {
    rocketsString += makeRocketElement(launch);
  });
  if (!allBirthdayLaunchesContainer.innerHTML) {
    const title = document.createElement('h2');
    title.classList.add('title', 'is-size-3');
    title.textContent = 'All Rocket Launches Since Your Birthday!';
    allLaunchesSince.prepend(title);
  }
  allBirthdayLaunchesContainer.innerHTML = rocketsString;
};

const fetchRocketData = async () => {
  try {
    if (!dateElement.validity.valid) throw new Error(dateElement.validationMessage);
    logoElement.classList.toggle('animate', true);
    const curDate = new Date();
    const [year, month, day] = dateElement.value.split('-');
    const endDate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getFullYear() === Number(year) && curDate.getMonth() + 1 === Number(month) ? Number(day) + 1 : Number(day));
    const data = await makeRocketFetch(dateElement.value, getFormattedDate(endDate));
    launchResponse = { ...data };
    allLaunchesSince.style.display = '';
    updatePaginationButtons();
    updateDisplayedRockets();
    if (data.status === 'error' && data.msg === 'None found') throw new Error('No launches found for your birthday. Look below however for every launch since your birthday.');
    else if (data.status === 'error') throw new Error(data.msg);
    if (data.launches.length <= 0) throw new Error('No launches found for your birthday. Look below however for every launch since your birthday.');
    errorElement.classList.toggle('hidden', true);
    let nonMatches = 0;
    data.launches.forEach((launch) => {
      if (getFormattedDate(new Date(launch.net)) !== dateElement.value) {
        if (data.launches.length === 1) {
          throw new Error('No launches found for your birthday. Look below however for every launch since your birthday.');
        } else {
          nonMatches += 1;
          return;
        }
      } else {
        birthdayLaunchesContainer.innerHTML = makeRocketElement(launch);
      }
    });
    if (nonMatches === data.launches.length) throw new Error('No launches found for your birthday. Look below however for every launch since your birthday.');
  } catch (error) {
    birthdayLaunchesContainer.innerHTML = '';
    errorElement.classList.toggle('hidden', false);
    errorMessageElement.textContent = error.message;
  }
  logoElement.classList.toggle('animate', false);
};

firstPaginationButton.addEventListener('click', () => handlePaginationButton('first'));
prevPaginationButton.addEventListener('click', () => handlePaginationButton('prev'));
nextPaginationButton.addEventListener('click', () => handlePaginationButton('next'));
lastPaginationButton.addEventListener('click', () => handlePaginationButton('last'));

errorButtonElement.addEventListener('click', () => {
  errorElement.classList.toggle('hidden', true);
});

dateElement.addEventListener('keyup', (event) => {
  if (event.keyCode === 13) {
    fetchRocketData();
  }
});

logoElement.addEventListener('click', fetchRocketData);

