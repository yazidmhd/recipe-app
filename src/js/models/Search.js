import axios from 'axios';

export default class Search {
    constructor(query){
        this.query = query;
    }

    async getResults(){
        const apiAppID = 'fcbff808';
        const apiKey = '157d742605386345d5abb6a41c716853';
        const baseURL = `http://api.edamam.com`;

        try {
            const res = await axios(`${baseURL}/search?app_id=${apiAppID}&app_key=${apiKey}&q=${this.query}&from=0&to=30`);

            this.result = res.data.hits.map(el => el.recipe);

        } catch(error){
            alert(error);
        }
    }

}