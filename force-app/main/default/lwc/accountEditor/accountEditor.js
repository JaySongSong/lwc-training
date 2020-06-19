/* eslint-disable no-console */
import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';

export default class AccountEditor extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    @track recordId;
    @track recordUrl;
    @track isLoading=false;

    accounTag;
    constructor() {
        super();
        this.recordId = null; // needs to be initialized
        this.recordUrl = null; // needs to be initialized
    }

    connectedCallback() {
        registerListener('editAccount', this.handleAccountEdit, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        // pubsub event
        fireEvent(this.pageRef, 'saveAccountDraft', {...fields, AccountUrl__c : this.recordUrl, tag: this.accounTag, Id : this.recordId});
        this.clearForm();
    }

    handleAccountEdit(accountParam) {
        this.isLoading = true;
        this.clearForm();
        const account = JSON.parse(JSON.stringify(accountParam));
        this.recordId = account.Id;
        this.recordUrl = account.AccountUrl__c;
        this.accounTag = account.tag;
        
    }

    handleOnLoad() {
        this.isLoading = false;
    }

    clearForm() {
        this.recordId = null;
        this.recordUrl = null;
        this.accounTag = null;
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        inputFields.forEach(inField => {
            inField.reset();
        });
    }
}
