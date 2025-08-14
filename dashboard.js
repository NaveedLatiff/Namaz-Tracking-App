import { 
    db, 
    auth, 
    signOut, 
    onAuthStateChanged,
    doc,
    setDoc,
    getDoc
} from './firebase.js';

let selectedNamaz;

function openNamazAns(e) {
    selectedNamaz = e.currentTarget.querySelector('p').innerText.trim();
    document.querySelector(".allNamazCont").style.display = "none";
    document.querySelector(".namazAnswers").style.display = "flex";
}

document.querySelectorAll(".namaz").forEach(btn => {
    btn.addEventListener("click", openNamazAns);
});

function closeNamazAns() {
    document.querySelector(".allNamazCont").style.display = "flex";
    document.querySelector(".namazAnswers").style.display = "none";
}

function getTodayDateString() {
    const now = new Date();
    const pakistanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Karachi"}));
    const year = pakistanTime.getFullYear();
    const month = String(pakistanTime.getMonth() + 1).padStart(2, '0');
    const day = String(pakistanTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function saveUserPrayerData(prayerName, status, date) {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        const docRef = doc(db, "userPrayers", `${user.uid}_${date}`);
        const docSnap = await getDoc(docRef);
        let currentData = {};
        
        if (docSnap.exists()) {
            currentData = docSnap.data();
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
        
        await setDoc(docRef, updateData);
        console.log("Prayer data saved successfully");
        
    } catch (error) {
        console.error("Error saving prayer data:", error);
    }
}

function updatePrayerUI(namazName, status) {
    document.querySelectorAll(".namaz").forEach((x) => {
        const namazNameElement = x.querySelector("p").innerText.trim();
        if (namazNameElement === namazName) {
            if (status === "Missed") {
                x.style.backgroundColor = "red";
            } else {
                x.style.backgroundColor = "green";
            }
            x.disabled = true;
            x.querySelector('h6').innerText = "(" + status + ")";
        }
    });
    
    document.querySelector(".namazAnswers").style.display = "none";
    document.querySelector(".allNamazCont").style.display = "flex";
}

async function selectOption(e) {
    const status = e.currentTarget.innerText.trim();
    const today = getTodayDateString();
    
    try {
        await saveUserPrayerData(selectedNamaz, status, today);
        updatePrayerUI(selectedNamaz, status);
    } catch (error) {
        console.error("Error saving prayer data:", error);
        alert("Failed to save prayer data. Please try again.");
    }
}

async function loadTodayPrayerData() {
    const user = auth.currentUser;
    if (!user) return;
    
    const today = getTodayDateString();
    
    try {
        const docRef = doc(db, "userPrayers", `${user.uid}_${today}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            const prayers = data.prayers || {};
            
            document.querySelectorAll(".namaz").forEach((namazBtn) => {
                const namazName = namazBtn.querySelector('p').innerText.trim().toLowerCase();
                const status = prayers[namazName];
                
                if (status) {
                    if (status === "Missed") {
                        namazBtn.style.backgroundColor = "red";
                    } else {
                        namazBtn.style.backgroundColor = "green";
                    }
                    namazBtn.disabled = true;
                    namazBtn.querySelector('h6').innerText = "(" + status + ")";
                }
            });
        }
    } catch (error) {
        console.error("Error loading prayer data:", error);
    }
}

window.closeNamazAns = closeNamazAns;
window.selectOption = selectOption;

let eng_date = document.querySelector(".eng-date");
let pakistanTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Karachi"});
let today = new Date(pakistanTime);
let todayDate = today.getDate();
let todayMonth = today.getMonth() + 1;
let todayYear = today.getFullYear();
eng_date.innerHTML = todayDate + "/" + todayMonth + "/" + todayYear;

let signout = () => {
    signOut(auth).then(() => {
        location.href = "./index.html";
    }).catch((error) => {
        console.error("Signout error:", error);
    });
}

document.querySelector(".logOutBtn").addEventListener("click", signout);

onAuthStateChanged(auth, (user) => {
    if (!user) {
        location.href = "./index.html";
    } else {
        loadTodayPrayerData();
    }
});