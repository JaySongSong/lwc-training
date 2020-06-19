import { LightningElement, track } from 'lwc';

export default class App extends LightningElement {

    @track searchValue;

    putSearchValue(event){
        this.searchValue = event.target.value;
    }

    doSearch(event){
        this.template.querySelector('c-child-card').filterTo(this.searchValue);
    }
}
