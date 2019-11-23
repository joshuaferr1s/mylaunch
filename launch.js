const logo = document.querySelector('#logo');
const dateElement = document.querySelector('input[type="date"');

const getFormattedDate = (date) => {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .split("T")[0];
};

logo.addEventListener('click', async () => {
  logo.classList.toggle('animate');
  try {
    const [year, month, day] = dateElement.value.split('-');
    const nextDay = new Date(Number(year), Number(month - 1), Number(day) + 1);
    const result = await fetch(`https://launchlibrary.net/1.3/launch/${dateElement.value}/${getFormattedDate(nextDay)}`);
    const data = await result.json();
    if (data.status === 'error') throw new Error(data.msg);
    if (data.launches.length <= 0) throw new Error('No launches found for that date.');
    data.launches.forEach((launch) => {
      console.log(launch.name);
      console.log(launch.rocket.imageURL);
      console.log(launch.vidURLs);
      console.log(launch.infoURLs);
      console.log(launch.failReason ? 'Launch Unsuccessful' : 'Launch Successful')
    });
  } catch (error) {
    console.log(error);
  }
  logo.classList.toggle('animate');
});

