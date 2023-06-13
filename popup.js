const workTimeInput = document.getElementById('workTime');
const breakTimeInput = document.getElementById('breakTime');
const lapsInput = document.getElementById('laps');
const startPomodoroButton = document.getElementById('startPomodoro');
const stopPomodoroButton = document.getElementById('stopPomodoro');
const timerContainer = document.getElementById('timerContainer');
const timerType = document.getElementById('timerType');
const timerElement = document.getElementById('timer');
const lapCounter = document.getElementById('lapCounter');

startPomodoroButton.addEventListener('click', () => {
  const workTime = parseInt(workTimeInput.value) * 60;
  const breakTime = parseInt(breakTimeInput.value) * 60;
  const laps = parseInt(lapsInput.value);

  chrome.runtime.sendMessage({
    action: 'startPomodoro',
    workTime: workTime,
    breakTime: breakTime,
    laps: laps
  });
});

stopPomodoroButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'stopPomodoro' });
});

const popupPort = chrome.runtime.connect({ name: 'popup' });

popupPort.onMessage.addListener((message) => {
  if (message.action === 'updateTimer') {
    updateTimerDisplay(message.isWorkTime, message.workTime, message.breakTime, message.currentLap, message.laps);
  }
});

window.addEventListener('unload', () => {
  popupPort.disconnect();
});

function updateTimerDisplay(isWorkTime, workTime, breakTime, currentLap, laps) {
  timerContainer.classList.remove('hidden');
  timerType.textContent = isWorkTime ? 'Work Time' : 'Break Time';
  timerElement.textContent = formatTime(isWorkTime ? workTime : breakTime);
  lapCounter.textContent = `Lap ${currentLap} of ${laps}`;

  if ((isWorkTime && workTime <= 3) || (!isWorkTime && breakTime <= 3)) {
    timerElement.classList.add('blink');
  } else {
    timerElement.classList.remove('blink');
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

