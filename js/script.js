const inputElement = document.querySelector("#search-input");
const searchIcon = document.querySelector("#search-close-icon");
const sortWrapper = document.querySelector(".sort-wrapper");

inputElement.addEventListener("input", () => handleInputChange(inputElement));
searchIcon.addEventListener("click", handleSearchCloseOnClick);
sortWrapper.addEventListener("click", handleSortIconOnClick);

function handleInputChange(inputElement) {
    searchIcon.classList.toggle("search-close-icon-visible", inputElement.value !== "");
}

function handleSearchCloseOnClick() {
    inputElement.value = "";
    searchIcon.classList.remove("search-close-icon-visible");
}

function handleSortIconOnClick() {
    document.querySelector(".filter-wrapper").classList.toggle("filter-wrapper-open");
    document.body.classList.toggle("filter-wrapper-overlay");
}
