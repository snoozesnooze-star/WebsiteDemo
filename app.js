// --- NOTIFICATION LOGIC ---
function setupNotifications() {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            alert("Reminders enabled! I'll check in at 8:00 AM.");
            scheduleCheck();
            document.getElementById('notif-btn').style.display = 'none';
        }
    });
}

function scheduleCheck() {
    // Check every 15 minutes if we need to send a notification
    setInterval(checkTimeAndNotify, 15 * 60 * 1000);
    checkTimeAndNotify(); // Check immediately on load
}

function checkTimeAndNotify() {
    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toDateString();
    
    // Define our two target windows
    const morningStart = 8; // 8 AM
    const eveningStart = 20; // 8 PM (20:00)

    // 1. Get the last time she took medicine
    const logs = JSON.parse(localStorage.getItem('medLogs') || '[]');
    const lastLog = logs[0];
    
    let needsMedicine = false;
    let timeLabel = "";

    if (lastLog) {
        const lastLogDate = new Date(lastLog.timestamp);
        const lastLogDateString = lastLogDate.toDateString();
        const lastLogHour = lastLogDate.getHours();

        // Morning Logic: It's between 8 AM and 8 PM
        if (currentHour >= morningStart && currentHour < eveningStart) {
            // If the last pill was NOT today, OR it was today but before 8 AM
            if (lastLogDateString !== today || lastLogHour < morningStart) {
                needsMedicine = true;
                timeLabel = "Morning";
            }
        } 
        // Evening Logic: It's after 8 PM or before 8 AM (next day)
        else if (currentHour >= eveningStart || currentHour < morningStart) {
            // If the last pill was today but before 8 PM
            if (lastLogDateString !== today || lastLogHour < eveningStart) {
                // Special check: if it's past midnight, "today" changed, 
                // so we check if she took it yesterday evening.
                needsMedicine = true;
                timeLabel = "Evening";
            }
        }
    } else {
        // If there are no logs at all, start nagging if it's past 8 AM
        if (currentHour >= morningStart) {
            needsMedicine = true;
            timeLabel = "Initial";
        }
    }

    if (needsMedicine) {
        sendNagNotification(timeLabel);
    }
}

function sendNagNotification(label) {
    const lastNag = localStorage.getItem('lastNagTimestamp');
    const oneHour = 60 * 60 * 1000;

    if (!lastNag || (Date.now() - lastNag) > oneHour) {
        new Notification(`💊 ${label} Medicine Reminder`, {
            body: `It's time for your medication! Please log it now.`,
            icon: "icon-192.png",
            tag: "med-nag",
            requireInteraction: true
        });

        localStorage.setItem('lastNagTimestamp', Date.now());
    }
}

function sendNagNotification() {
    // Check if we already sent one this hour to avoid spamming every second
    const lastNag = localStorage.getItem('lastNagTimestamp');
    const oneHour = 60 * 60 * 1000;

    if (!lastNag || (Date.now() - lastNag) > oneHour) {
        const notif = new Notification("Medicine Reminder 💊", {
            body: "You haven't logged your medicine yet. Please take it now!",
            icon: "icon-192.png",
            tag: "med-nag", // This groups notifications so they don't stack 100 times
            requireInteraction: true // This keeps it visible longer on some devices
        });

        localStorage.setItem('lastNagTimestamp', Date.now());

        notif.onclick = () => {
            window.focus();
            this.close();
        };
    }
}