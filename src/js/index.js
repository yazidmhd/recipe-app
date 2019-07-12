import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

/** GLOBAL STATE OF THE APP, inside will have:
- Search object
- Current recipe object
- Shopping list object
- Liked recipes
*/
const state = {};

//---SEARCH CONTROLLER---
const controlSearch = async () => {
    //get query from view
    const query = searchView.getInput();
    
    if(query){
        //new search object and add to state
        state.search = new Search(query);

        //prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try{
            //search for the recipes
            await state.search.getResults();

            //render/display results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert('Something wrong with the search...');
            clearLoader();
        }
        
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    //closest - find the closest element (btn-inline) at the point of where the click happens
    //btn.dataset.goto - retrieve the data attribute named goto that is saved in the btn element's data attribute
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


//---RECIPE CONTROLLER---
const controlRecipe = async () => {
    //get ID from url
    const id = window.location.hash.replace('#','');

    if(id){
        //prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highlight selected search item
        if(state.search){
            searchView.highlightedSelected(id);    
        }
        
        //create new recipe object
        state.recipe = new Recipe(id);

        try{
            //get recipe data & parseIngredient
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            
            //render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );

        } catch (error) {
            alert('Error processing recipe!');
        }
        
    }
};

//hashchange - an event that fires off each time the hash in the url changes to something else
//window.addEventListener - adding an event listener to the global window
//load - an event that fires whenever the page is loaded
//matches - match the exact css selector or its childs with *

//a way to load more than one event listener at a time
['hashchange','load'].forEach(event => window.addEventListener(event, controlRecipe));

//---LIST CONTROLLER---
const controlList = () => {
    //create a new list if there is none yet
    if(!state.list){
        state.list = new List();
    }

    //add each ingredient into list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count,el.unit,el.ingredient);
        listView.renderItem(item);
    });

};

//---LIKE CONTROLLER---
const controlLike = () => {
    if(!state.likes){
        state.likes = new Likes();
    }

    const currentID = state.recipe.id;

    //user has not yet liked current recipe 
    if(!state.likes.isLiked(currentID)){
        //add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //toggle the like button
        likesView.toggleLikeBtn(true);

        //add like to the UI list
        likesView.renderLike(newLike);

    //user has liked current recipe    
    } else {
        //remove like from the state
        state.likes.deleteLike(currentID);

        //toggle the like button
        likesView.toggleLikeBtn(false);

        //remove like from the UI list
        likesView.deleteLike(currentID);

    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    //restore likes
    state.likes.readStorage();

    //toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //render existing likes
    state.likes.likes.forEach(el => likesView.renderLike(el));
})

//handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle delete btn
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //delete from state and UI
        state.list.deleteItem(id);
        listView.deleteItem(id);
    //handle count update
    } else if(e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        if(val > 0){
            state.list.updateCount(id,val);
        }
    }
})

elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        if(state.recipe.servings > 1){
            //decrease button is clicked
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if(e.target.matches('.btn-increase, .btn-increase *')){
        //increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        //add ingredients to shopping list
        controlList();
    } else if(e.target.matches('.recipe__love, .recipe__love *')){
        //like controller
        controlLike();
    }
});