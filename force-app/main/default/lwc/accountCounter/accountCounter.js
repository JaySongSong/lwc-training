import { LightningElement, api, track } from 'lwc';

export default class AccountCounter extends LightningElement {
    @api draftCount;
    @api modifiedCount;

    @track disableButton = false;

    renderedCallback() {
        this.disableButton = this.draftCount <= 0 && this.modifiedCount <= 0;
    }

    handleSaveDrafts() {
        this.dispatchEvent(new CustomEvent('save'));
    }
}
