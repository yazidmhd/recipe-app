import axios from 'axios';
import { apiAppID, apiKey, key, rapidKey } from '../config';

export default class Recipe {
    constructor(id){
        this.id = id;
    }

    async getRecipe(){
        try {
            //food2fork api
            // const res = await axios(`https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);

            //rapid api
            const res = await axios(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${this.id}/information`, {
                headers: {
                    'X-RapidAPI-Host':'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
                    'X-RapidAPI-Key':`${rapidKey}`
                }
            });

            this.title = res.data.title;
            this.author = res.data.sourceName;
            this.img = res.data.image;
            this.url = res.data.sourceUrl;
            this.ingredients = res.data.extendedIngredients.map(el => el.originalString);
        } catch(error){
            alert('Something went wrong');
        }
    }

    calcTime() {
        //assuming that we need 15 min for each 3 ingredients
        const numIngredients = this.ingredients.length;
        const periods = Math.ceil(numIngredients / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }


    parseIngredients() {
        const unitsLong = ['tablespoons','tablespoon','ounceS','ounce','teaspoons','teaspoon','cups','pounds','kilogram','kg','gram','g'];
        const unitsShort = ['tbsp','tbsp','oz','oz','tsp','tsp','cup','pound'];
        const units = [...unitsShort,'kg','kg','g','g'];

        const newIngredients = this.ingredients.map(el => {
            //uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((current, i) => {
                ingredient = ingredient.replace(current, unitsShort[i])
            });

            //remove parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            //parse ingredients into count, unit and ingredient  
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIngredient;
            if(unitIndex > -1){
                //unit exists
                //eg: 4 1/2 cups, arrCount = [4, 1/2] --> eval("4+1/2") --> 4.5
                //eg: 4 cups, arrCount = [4]
                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if(arrCount.length === 1){
                    count = eval(arrIng[0].replace('-','+'));
                } else {
                    count = eval(arrIng.slice(0,unitIndex).join('+'));
                }

                objIngredient = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }
            } else if(parseInt(arrIng[0], 10)){
                //no unit exists, but first element is a number
                objIngredient = {
                    count: parseInt(arrIng[0],10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } 
            else if(unitIndex === -1){
                //no unit exists and no number in 1st position
                objIngredient = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            } 

            return objIngredient;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        //servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }

}