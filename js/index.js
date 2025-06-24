// mobile toggler
 
function menuBar() {
    const navLinks = document.getElementById("on-mobile-screen");
    const openMenu = document.getElementById("on-mobile-menu");
    const closeMenu = document.getElementById("close-menu");
    navLinks.style.display = "flex";
    closeMenu.style.display = "flex";
    openMenu.style.display = "none";

}

function closeMenu () {
    const navLinks = document.getElementById("on-mobile-screen");
    const openMenu = document.getElementById("on-mobile-menu");
    const closeMenu = document.getElementById("close-menu");
    navLinks.style.display = "none";
    closeMenu.style.display = "none";
    openMenu.style.display = "flex";
}