let workTime, breakTime, laps, currentLap, timer, isWorkTime;
let popupPort;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startPomodoro') {
    workTime = request.workTime;
    breakTime = request.breakTime;
    laps = request.laps;
    currentLap = 1;
    isWorkTime = true;

    startTimer();
  } else if (request.action === 'stopPomodoro') {
    clearInterval(timer);
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    popupPort = port;
    popupPort.onDisconnect.addListener(() => {
      popupPort = null;
    });
  }
});

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (isWorkTime) {
      workTime--;
      if (workTime <= 0) {
        isWorkTime = false;
        showNotification('Break Time');
      }
    } else {
      breakTime--;
      if (breakTime <= 0) {
        isWorkTime = true;
        currentLap++;
        if (currentLap > laps) {
          clearInterval(timer);
          return;
        }
        showNotification('Work Time');
      }
    }
    sendTimerDataToPopup();
  }, 1000);
}

function sendTimerDataToPopup() {
  if (popupPort) {
    popupPort.postMessage({
      action: 'updateTimer',
      isWorkTime: isWorkTime,
      workTime: workTime,
      breakTime: breakTime,
      currentLap: currentLap,
      laps: laps
    });
  }
}

function showNotification(message) {
  const options = {
    type: 'basic',
    iconUrl: 'images/icon128.png',
    title: 'Pomodoro Timer',
    message: message
  };
  chrome.notifications.create('', options);
}

