const logoElement = document.querySelector('#logo');
const dateElement = document.querySelector('input[type="date"');
const errorElement = document.querySelector('#error');
const errorButtonElement = document.querySelector('#errorButton');
const errorMessageElement = document.querySelector('#errorMessage');

const getFormattedDate = (date) => {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
  .toISOString()
  .split("T")[0];
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
    data.launches.forEach((launch) => {
      console.log(launch.name);
      console.log(launch.rocket.imageURL);
      console.log(launch.vidURLs);
      console.log(launch.infoURLs);
      console.log(launch.failReason ? 'Launch Unsuccessful' : 'Launch Successful')
    });
  } catch (error) {
    errorElement.classList.toggle('hidden', false);
    errorMessageElement.textContent = error.message;
  }
  logoElement.classList.toggle('animate', false);
});

