const popUp = document.querySelector(".popup")
const code = document.querySelector('#date')
const sure = document.querySelector('#sure')
const actualCode = code.innerHTML

popUp.style.display = "none"
// code.innerHTML = 'Show Code'
code.addEventListener("click", showOption)
sure.addEventListener('click', showCode)

function showOption() {
    popUp.style.display = "flex";
}

function showCode() {
    code.innerHTML = actualCode
    // popUp.style.display = 'none'
}