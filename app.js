let eye = document.querySelector(".eye-logo")
function tooglePassword() {
    if (document.querySelector(".l-pass").type == "password") {
        document.querySelector(".l-pass").type = "text"
        eye.src = "assests/unvisible-eye.svg"
    }
    else {
        document.querySelector(".l-pass").type = "password"
        eye.src = "assests/visible-eye.svg"
    }
}
eye.addEventListener("click", tooglePassword)

import {
    auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut,
    GoogleAuthProvider, provider, signInWithPopup
} from "./firebase.js"


// // Sign In
let signIn = () => {
    let lemail = document.querySelector(".l-email").value
    let lpassword = document.querySelector(".l-pass").value
    signInWithEmailAndPassword(auth, lemail, lpassword)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user)
            Swal.fire({
                title: "SignIn Successfully",
                icon: "success",
                confirmButtonText: "Ok"
            }).then((result) => {
                if (result.isConfirmed) {
                    location.href = "dashboard.html";
                }
            })
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            Swal.fire({
                icon: "error",
                title: "SignIn Failed",
                text: errorMessage
            });
        });

}

document.querySelector(".login-btn").addEventListener("click", signIn)


onAuthStateChanged(auth, (user) => {
    if (user) {
        location.href = "dashboard.html";
    }

});

let googleLogin = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log(user)
            location.href = "dashboard.html"
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
        });
}
document.querySelector(".googleBtn").addEventListener("click", googleLogin)

