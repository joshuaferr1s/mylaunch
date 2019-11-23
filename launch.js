const logoElement = document.querySelector('#logo');
const dateElement = document.querySelector('input[type="date"');
const errorElement = document.querySelector('#error');
const errorButtonElement = document.querySelector('#errorButton');
const errorMessageElement = document.querySelector('#errorMessage');
const launchesContainer = document.querySelector('#launches');

const getFormattedDate = (date) => {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
  .toISOString()
  .split("T")[0];
};

const appendRocketToDom = ({ name, rocket: { imageURL }, vidURLs, infoURLs, failreason }) => {
  launchesContainer.innerHTML = `
<div class="card column is-4">
  <div class="card-image">
    <img src="${imageURL}" style="max-height: 10rem;">
  </div>
  <div class="card-content">
    <p class="title is-size-4 has-text-black">${name}</p>
    <p class="subtitle is-size-6 has-text-black">${failreason ? 'Launch Unsuccessful' : 'Launch Successful'}</p>
    <small class="is-size-7 has-text-black">${failreason ? failreason : ''}</small>
  </div>
  <div class="card-footer">
    <a href="${vidURLs && vidURLs.length > 0 ? vidURLs[0] : ''}" class="card-footer-item ${!vidURLs || vidURLs.length <= 0 ? ' has-text-grey' : ''}" target="_blank" rel="noopener noreferrer">Watch</a>
    <a href="${infoURLs && infoURLs.length > 0 ? infoURLs[0] : ''}" class="card-footer-item ${!infoURLs || infoURLs.length <= 0 ? ' has-text-grey' : ''}" target="_blank" rel="noopener noreferrer">More info</a>
  </div>
</div>
`;
};

dateElement.setAttribute('max', getFormattedDate(new Date()));

errorButtonElement.addEventListener('click', () => {
  errorElement.classList.toggle('hidden', true);
});

logoElement.addEventListener('click', async () => {
  try {
    if (!dateElement.validity.valid) throw new Error(dateElement.validationMessage);
    logoElement.classList.toggle('animate', true);
    const [year, month, day] = dateElement.value.split('-');
    const nextDay = new Date(Number(year), Number(month - 1), Number(day) + 1);
    const result = await fetch(`https://launchlibrary.net/1.3/launch/${dateElement.value}/${getFormattedDate(nextDay)}`);
    const data = await result.json();
    if (data.status === 'error' && data.msg === 'None found') throw new Error('Sorry no rockets were launched on your birthday');
    else if (data.status === 'error') throw new Error(data.msg);
    if (data.launches.length <= 0) throw new Error('No launches found for that date.');
    data.launches.forEach((launch) => appendRocketToDom(launch));
  } catch (error) {
    errorElement.classList.toggle('hidden', false);
    errorMessageElement.textContent = error.message;
  }
  logoElement.classList.toggle('animate', false);
});

