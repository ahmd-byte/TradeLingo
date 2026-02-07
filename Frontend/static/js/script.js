// script.js

document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.getElementsByClassName("module-btn");
    for (let btn of buttons) {
        btn.addEventListener("click", function() {
            const content = this.nextElementSibling;
            content.classList.toggle("active");
        });
    }
});
