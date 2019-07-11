import axios from 'axios';
import { apiAppID, apiKey, key, rapidKey } from '../config';

export default class Search {
    constructor(query){
        this.query = query;
    }

    async getResults(){
        try {
            //edamam api
            // const res = await axios(`http://api.edamam.com/search?app_id=${apiAppID}&app_key=${apiKey}&q=${this.query}&from=0&to=30`);
            // this.result = res.data.hits.map(el => el.recipe);]

            //food2fork api
            // const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            // this.result = res.data.recipes;

            //rapid api
            const res = await axios(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search?query=${this.query}&number=30`, {
                headers: {
                    'X-RapidAPI-Host':'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
                    'X-RapidAPI-Key':`${rapidKey}`
                }
            });

            this.result = res.data.results;

        } catch(error){
            alert(error);
        }
    }

}