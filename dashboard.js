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

// Save prayer data to Firebase
async function saveUserPrayerData(prayerName, status, date) {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        const docRef = doc(db, "userPrayers", `${user.uid}_${date}`);
        
        // Get current document data
        const docSnap = await getDoc(docRef);
        let currentData = {};
        
        if (docSnap.exists()) {
            currentData = docSnap.data();
        }
        
        // Update the specific prayer
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

// Update UI after selection
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
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
        // Save to Firebase
        await saveUserPrayerData(selectedNamaz, status, today);
        
        // Update UI
        updatePrayerUI(selectedNamaz, status);
        
    } catch (error) {
        console.error("Error saving prayer data:", error);
        alert("Failed to save prayer data. Please try again.");
    }
}

// Load today's prayer data
async function loadTodayPrayerData() {
    const user = auth.currentUser;
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const docRef = doc(db, "userPrayers", `${user.uid}_${today}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            const prayers = data.prayers || {};
            
            // Update UI based on saved data
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

// Make functions global
window.closeNamazAns = closeNamazAns;
window.selectOption = selectOption;

// Date display
let eng_date = document.querySelector(".eng-date");
let today = new Date();
let todayDate = today.getDate();
let todayMonth = today.getMonth() + 1; // Month is 0-indexed, so add 1
let todayYear = today.getFullYear();
eng_date.innerHTML = todayDate + "/" + todayMonth + "/" + todayYear;

// SignOut
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
        // Load today's prayer data when user is authenticated
        loadTodayPrayerData();
    }
});