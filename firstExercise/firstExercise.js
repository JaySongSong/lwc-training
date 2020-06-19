import { LightningElement, track } from 'lwc';

export default class App extends LightningElement {
    @track post = '';
    @track areThoughtsVisible = false;

    handleTextChange(event) {
        this.post = event.target.value;
    }

    handleTickChange(event) {
        this.areThoughtsVisible = event.target.checked;
    }
}
