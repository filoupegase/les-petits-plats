import { sortAlpha } from "../utils/utilitis.js";

export class RecipeList {
  constructor(recipes) {
    this.recipes = recipes;
    this._sortByName();
  }

  get sortedApplicances() {
    return sortAlpha(this._collectAppliances());
  }

  _sortByName() {
    return this.recipes.sort((recipe1, recipe2) => {
      const name1 = recipe1.name.toLowerCase();
      const name2 = recipe2.name.toLowerCase();

      const [sortedName1, sortedName2] = sortAlpha([name1, name2]);

      if (sortedName1 === name2) return 1;
      if (sortedName2 === name1) return -1;
      return 0;
    });
  }

  _collectAppliances() {
    const appliances = new Set();

    for (let recipe of this.recipes) {
      appliances.add(capitalizeFirstChar(recipe.appliance));
    }

    return [...appliances]
  }

  search(TEST_REQUEST_1, HASH_TABLE_FOR_SEARCHING_RECIPES) {
    return undefined;
  }
}