import { RecipeCard } from "./components/cards.js";
import { keepOnlyLettersAndRemoveAccents } from "../utils/utilitis.js";


const BREAKPOINTS = {
    small: 840,
    medium: 1200,
};
const FILTERS = ["ingredient", "appliance", "ustensil"];
const ITEMS_LINE_HEIGHT = 39;

export class HomePageBuilder {
    constructor(recipesList, hashTableForSearchingRecipes) {
        this._recipesList = recipesList;
        this._hashTableForSearchingRecipes = hashTableForSearchingRecipes;
        this._badgesList = [];
        this._filtersItems = {
            ingredient: this._recipesList.sortedIngredients,
            appliance: this._recipesList.sortedAppliances,
            ustensil: this._recipesList.sortedUstensils,
        };
    }

    get _userRequest() {
        const searchBarInput = document.getElementById("search-bar-input");

        return {
            userInput: searchBarInput.value.trim(),
            joinedBadges: this._badgesList.join(" ").trim(),
        };
    }

    getRecipesListToDisplay() {
        return this._recipesList.search(
            this._userRequest,
            this._hashTableForSearchingRecipes
        );
    }

    getItemsListsToDisplay(recipesList) {
        return {
            ingredient: recipesList.sortedIngredients,
            appliance: recipesList.sortedAppliances,
            ustensil: recipesList.sortedUstensils,
        };
    }

    render() {
        this._renderFiltersOptions(this._filtersItems);
        this._renderCards(this._recipesList);

        this._addSearchBarEvents();
        this._addOpenFiltersEvents();
        this._addCloseAllFiltersEvent();
        this._addResizeOpenedFilterListsEvent();
    }

    _renderFiltersOptions(itemsLists) {
        for (let filter of FILTERS) {
            const itemsList = document.getElementById(`${ filter }-list`);

            let htmlContent = "";

            for (let item of itemsLists[filter]) {
                htmlContent += `<li>${ item }</li>`;
            }

            itemsList.innerHTML = htmlContent;
        }

        this._resizeOpenedFilter();
        this._addSearchWithFiltersEvents();
    }

    _renderCards(recipesList) {
        const cardsWrapper = document.getElementById("cards-wrapper");

        let htmlContent = "";

        for (let i = 0; i < recipesList.recipes.length; i++) {
            htmlContent += new RecipeCard(recipesList.recipes[i], i).html;
        }

        cardsWrapper.innerHTML = htmlContent;
    }

    _closeAllFiltersExceptClicked(clickedFilter) {
        for (let filter of FILTERS) {
            if (filter !== clickedFilter) {
                const filterLabel = document.getElementById(`${ filter }-filter-label`);
                const filterIcon = document.getElementById(`${ filter }-filter-icon`);
                const itemsList = document.getElementById(`${ filter }-list`);

                filterLabel.classList.remove("clicked");
                filterIcon.classList.add("fa-chevron-down");
                filterIcon.classList.remove("fa-chevron-up");
                itemsList.classList.add("closed");

                itemsList.style.height = 0;
            }
        }
    }

    _createFilterBadge(filter, textContent) {
        const filterBadgesWrapper = document.getElementById(
            `${ filter }-badges-wrapper`
        );

        const badgeDiv = document.createElement("div");
        const badgeSpan = document.createElement("span");
        const badgeCloseIcon = document.createElement("i");

        badgeDiv.className = `c-badge c-badge--${ filter }`;
        badgeSpan.textContent = textContent;
        badgeCloseIcon.className = "far fa-times-circle";

        badgeDiv.appendChild(badgeSpan);
        badgeDiv.appendChild(badgeCloseIcon);
        filterBadgesWrapper.appendChild(badgeDiv);

        this._badgesList.push(textContent);

        badgeCloseIcon.onclick = (e) => {
            e.stopPropagation();

            badgeDiv.remove();

            this._badgesList = this._badgesList.filter((elt) => elt !== textContent);

            let recipesListToDisplay;

            if (
                this._userRequest.userInput.length < 3 &&
                this._userRequest.joinedBadges === ""
            ) {
                recipesListToDisplay = this._recipesList;

                const messageAside = document.getElementById("message");

                messageAside.classList.remove("opened");
            } else {
                recipesListToDisplay = this.getRecipesListToDisplay();

                this._displaySearchResultMessage(recipesListToDisplay);
            }
            this._renderFiltersOptions(
                this.getItemsListsToDisplay(recipesListToDisplay)
            );
            this._renderCards(recipesListToDisplay);

            this._renderFiltersOptions(
                this.getItemsListsToDisplay(recipesListToDisplay)
            );
            this._renderCards(recipesListToDisplay);
        };
    }

    _displaySearchResultMessage(recipesList) {
        const messageAside = document.getElementById("message");
        const messageSpan = document.querySelector("#message span");

        messageAside.classList.remove("opened");

        let message;
        const recipesQuantity = recipesList.recipes.length;

        if (recipesQuantity === 0) {
            message =
                'Aucune recette ne correspond à votre recherche... Vous pouvez chercher "tarte aux pommes", "poisson", etc.';

            messageAside.classList.remove("c-message--info");
            messageAside.classList.add("c-message--warning");
        } else {
            message = `${ recipesQuantity } recette${
                recipesQuantity > 1 ? "s" : ""
            } correspond${ recipesQuantity > 1 ? "ent" : "" } à votre recherche.`;

            messageAside.classList.remove("c-message--warning");
            messageAside.classList.add("c-message--info");
        }

        messageSpan.textContent = message;

        messageAside.classList.add("opened");

        this._addCloseMessageEvent();
    }

    _resizeOpenedFilter() {
        const openedItemsList = document.querySelector("ul:not(.closed)");

        if (openedItemsList) {
            const filter = openedItemsList.getAttribute("data-filter");

            this._sizeFilterList(filter);
        }
    }

    _sizeFilterList(filter) {
        const itemsList = document.getElementById(`${ filter }-list`);
        const itemsLines = document.querySelectorAll(`#${ filter }-list li`);

        const windowWidth = window.innerWidth;
        const columnsInList =
            windowWidth < BREAKPOINTS.small
                ? 1
                : windowWidth < BREAKPOINTS.medium
                    ? 2
                    : 3;

        const itemsQuantity = itemsLines.length;

        itemsList.style.height = `${
            Math.ceil(itemsQuantity / columnsInList) * ITEMS_LINE_HEIGHT
        }px`;
    }

    _addCloseAllFiltersEvent() {
        const body = document.querySelector("body");

        body.onclick = () => {
            this._closeAllFiltersExceptClicked();
        };
    }

    _addCloseMessageEvent() {
        const messageAside = document.getElementById("message");
        const messageCloseIcon = document.querySelector("#message i");

        messageCloseIcon.onclick = () => {
            messageAside.classList.remove("opened");
        };
    }

    _addOpenFiltersEvents() {
        for (let filter of FILTERS) {
            const filterLabel = document.getElementById(`${ filter }-filter-label`);
            const filterIcon = document.getElementById(`${ filter }-filter-icon`);
            const filterInput = document.getElementById(`${ filter }`);
            const itemsList = document.getElementById(`${ filter }-list`);

            filterLabel.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();

                this._closeAllFiltersExceptClicked(filter);

                filterLabel.classList.toggle("clicked");
                filterIcon.classList.toggle("fa-chevton-down");
                filterIcon.classList.toggle("fa-chevron-up");
                itemsList.classList.toggle("closed");

                this._sizeFilterList(filter);

                filterInput.focus();
            };

            filterInput.onclick = (e) => {
                e.stopPropagation();
            };
        }
    }

    _addResizeOpenedFilterListsEvent() {
        window.onresize = () => {
            this._resizeOpenedFilter();
        };
    }

    _addSearchBarEvents() {
        const searchBarForm = document.getElementById("search-bar-form");
        const searchBarInput = document.getElementById("search-bar-input");

        searchBarForm.onclick = (e) => e.stopPropagation();

        searchBarInput.onfocus = () => {
            this._closeAllFiltersExceptClicked();
        };

        searchBarInput.oninput = (e) => {
            let recipesListToDisplay;

            if (searchBarInput.value.length >= 3) {
                recipesListToDisplay = this.getRecipesListToDisplay();

                this._displaySearchResultMessage(recipesListToDisplay);
            } else if (this._badgesList.length > 0) {
                recipesListToDisplay = this._recipesList.search(
                    {
                        userInput: "",
                        joinedBadges: this._userRequest.joinedBadges,
                    },
                    this._hashTableForSearchingRecipes
                );

                this._displaySearchResultMessage(recipesListToDisplay);
            } else {
                recipesListToDisplay = this._recipesList;

                const messageAside = document.getElementById("message");

                messageAside.classList.remove("opened");
            }

            this._renderFiltersOptions(
                this.getItemsListsToDisplay(recipesListToDisplay)
            );
            this._renderCards(recipesListToDisplay);
        };

        searchBarForm.onsubmit = (e) => {
            e.preventDefault();
            searchBarInput.blur();
        };
    }

    _addSearchWithFiltersEvents() {
        for (let filter of FILTERS) {
            const filterInput = document.getElementById(`${ filter }`);
            const itemsList = document.getElementById(`${ filter }-list`);
            const itemsLines = document.querySelectorAll(`#${ filter }-list li`);

            filterInput.oninput = () => {
                let itemsListsToDisplay = {};
                Object.assign(itemsListsToDisplay, this._filtersItems);

                itemsListsToDisplay[filter] = itemsListsToDisplay[filter].filter(
                    (item) =>
                        keepOnlyLettersAndRemoveAccents(item).startsWith(
                            keepOnlyLettersAndRemoveAccents(filterInput.value)
                        )
                );

                this._renderFiltersOptions(itemsListsToDisplay);
                this._sizeFilterList(filter);
            };

            filterInput.onsubmit = () => {
                filterInput.blur();
            };

            filterInput.addEventListener("focusout", () => {
                filterInput.value = "";
            });

            itemsList.onclick = (e) => e.stopPropagation();

            for (let itemLine of itemsLines) {
                itemLine.onclick = () => {
                    if (!this._badgesList.includes(itemLine.textContent)) {
                        this._createFilterBadge(filter, itemLine.textContent);

                        const recipesListToDisplay = this.getRecipesListToDisplay();

                        this._renderFiltersOptions(
                            this.getItemsListsToDisplay(recipesListToDisplay)
                        );
                        this._displaySearchResultMessage(recipesListToDisplay);
                        this._renderCards(recipesListToDisplay);

                        window.scrollTo(0, 0);
                    }
                };
            }
        }
    }
}
