let eye = document.querySelector(".eye-logo")
function tooglePassword() {
    if (document.querySelector(".s-pass").type == "password") {
        document.querySelector(".s-pass").type = "text"
        eye.src = "assests/unvisible-eye.svg"
    }
    else {
        document.querySelector(".s-pass").type = "password"
        eye.src = "assests/visible-eye.svg"
    }
}
eye.addEventListener("click", tooglePassword)


import {
    auth, createUserWithEmailAndPassword, onAuthStateChanged, db, addDoc
} from "./firebase.js"

// SignUp
let signUp = () => {
    let email = document.querySelector(".s-email").value
    let password = document.querySelector(".s-pass").value
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            Swal.fire({
                title: "SignUp Successfully",
                icon: "success",
                confirmButtonText: "Ok"
            }).then((result) => {
                if (result.isConfirmed) {
                    location.href = "dashboard.html";
                }
            });
        })

        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            Swal.fire({
                icon: "error",
                title: "SignUp Failed",
                text: errorMessage
            });
        });
}
document.querySelector(".signup-btn").addEventListener("click", signUp)

onAuthStateChanged(auth, (user) => {
    if (user) {
        location.href = "dashboard.html";
    }

});

