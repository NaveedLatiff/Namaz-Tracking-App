import { 
    db, 
    auth, 
    signOut, 
    onAuthStateChanged,
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    getDocs
} from './firebase.js';

let currentDaysFilter = 7;

function getDateRange(days) {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates.reverse();
}

async function loadPrayerHistory(days = 7) {
    const user = auth.currentUser;
    if (!user) return;

    const loading = document.querySelector('.loading');
    const historyList = document.querySelector('.history-list');
    
    loading.style.display = 'block';
    historyList.innerHTML = '';

    try {
        const dateRange = getDateRange(days);
        const historyData = [];

        for (const date of dateRange) {
            const docRef = doc(db, "userPrayers", `${user.uid}_${date}`);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                historyData.push({
                    date: date,
                    data: docSnap.data()
                });
            } else {
                // Add empty data for dates with no prayers
                historyData.push({
                    date: date,
                    data: {
                        prayers: {
                            fajr: null,
                            zuhr: null,
                            asar: null,
                            magrib: null,
                            isha: null
                        }
                    }
                });
            }
        }

        displayHistory(historyData);
        
    } catch (error) {
        console.error("Error loading history:", error);
        historyList.innerHTML = '<p class="error">Failed to load prayer history.</p>';
    } finally {
        loading.style.display = 'none';
    }
}

function displayHistory(historyData) {
    const historyList = document.querySelector('.history-list');
    historyList.innerHTML = '';

    historyData.forEach(dayData => {
        const dateObj = new Date(dayData.date);
        const formattedDate = formatDate(dateObj);
        const prayers = dayData.data.prayers || {};

        const dayCard = document.createElement('div');
        dayCard.className = 'history-day-card';
        
        dayCard.innerHTML = `
            <div class="history-date">
                <h3>${formattedDate}</h3>
                <small>${dayData.date}</small>
            </div>
            <div class="history-prayers">
                ${createPrayerRow('Fajr', prayers.fajr, dayData.date)}
                ${createPrayerRow('Zuhr', prayers.zuhr, dayData.date)}
                ${createPrayerRow('Asar', prayers.asar, dayData.date)}
                ${createPrayerRow('Magrib', prayers.magrib, dayData.date)}
                ${createPrayerRow('Isha', prayers.isha, dayData.date)}
            </div>
        `;

        historyList.appendChild(dayCard);
    });
}

function createPrayerRow(prayerName, status, date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    const isToday = compareDate.getTime() === today.getTime();
    const isPast = compareDate.getTime() < today.getTime();
    
    let statusClass = 'not-selected';
    let statusText = 'Not Selected';
    let actionButton = '';

    if (status) {
        statusClass = status.toLowerCase().replace(' ', '-').replace(/\s+/g, '-');
        statusText = status;
        actionButton = `<button class="btn select-btn edit-btn" onclick="selectPrayerStatus('${prayerName}', '${date}')">Edit</button>`;
    } else {
        if (isPast) {
            statusClass = 'not-tracked';
            statusText = 'Not Tracked';
        } else {
            statusText = 'Not Selected';
        }
        actionButton = `<button class="btn select-btn" onclick="selectPrayerStatus('${prayerName}', '${date}')">Select</button>`;
    }

    return `
        <div class="prayer-row">
            <span class="prayer-name">${prayerName}</span>
            <span class="prayer-status ${statusClass}">${statusText}</span>
            ${actionButton}
        </div>
    `;
}

function formatDate(date) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
        return 'Today';
    } else if (compareDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    } else {
        return compareDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

async function selectPrayerStatus(prayerName, date) {
    try {
        const { value: status } = await Swal.fire({
            title: `Select ${prayerName} status for ${formatDate(new Date(date))}`,
            input: 'select',
            inputOptions: {
                'On Time': 'On Time',
                'Qaza': 'Qaza',
                'Missed': 'Missed',
                'With Jamaah': 'With Jamaah'
            },
            inputPlaceholder: 'Select status',
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel'
        });

        if (status) {
            console.log(`Saving ${prayerName} as ${status} for ${date}`);
            await saveHistoryPrayerData(prayerName, status, date);
            loadPrayerHistory(currentDaysFilter); // Reload history
        }
    } catch (error) {
        console.error("Error in selectPrayerStatus:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update prayer status. Please try again.'
        });
    }
}

async function saveHistoryPrayerData(prayerName, status, date) {
    const user = auth.currentUser;
    if (!user) {
        console.error("No authenticated user");
        return;
    }
    
    try {
        console.log(`Attempting to save: ${prayerName} = ${status} for ${date}`);
        const docRef = doc(db, "userPrayers", `${user.uid}_${date}`);
        
        const docSnap = await getDoc(docRef);
        let currentData = { prayers: {} };
        
        if (docSnap.exists()) {
            currentData = docSnap.data();
            console.log("Existing data:", currentData);
        }
        
        if (!currentData.prayers) {
            currentData.prayers = {};
        }
        
        const updateData = {
            userId: user.uid,
            date: date,
            prayers: {
                ...currentData.prayers,
                [prayerName.toLowerCase()]: status
            },
            timestamp: new Date().toISOString()
        };
        
        console.log("Saving data:", updateData);
        await setDoc(docRef, updateData);
        console.log("Data saved successfully");
        
        Swal.fire({
            icon: 'success',
            title: 'Prayer Status Updated!',
            showConfirmButton: false,
            timer: 1500
        });
        
    } catch (error) {
        console.error("Error saving prayer data:", error);
        Swal.fire({
            icon: 'error',
            title: 'Failed to save',
            text: 'Please try again. Error: ' + error.message
        });
    }
}

window.selectPrayerStatus = selectPrayerStatus;

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        currentDaysFilter = parseInt(e.target.dataset.days);
        loadPrayerHistory(currentDaysFilter);
    });
});

// SignOut
document.querySelector(".logOutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
        location.href = "./index.html";
    }).catch((error) => {
        console.error("Signout error:", error);
    });
});

// Auth state change
onAuthStateChanged(auth, (user) => {
    if (!user) {
        location.href = "./index.html";
    } else {
        loadPrayerHistory(currentDaysFilter);
    }
});