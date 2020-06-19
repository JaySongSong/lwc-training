import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DynamicForm extends LightningElement {
    @track generated = false;
    @track form = {};
    @track loaded = false;
    @track object = '';
    @track fields = [];
    generateForm(){
        this.generated = false;
        this.loaded = false;
        const inputs = this.template.querySelectorAll('lightning-input');
        const allValid = [...inputs].reduce((validSoFar, inputCmp) => {
                    inputCmp.reportValidity();
                    return validSoFar && inputCmp.checkValidity();
        }, true);
        if(allValid){
            for(let i = 0; i < inputs.length; i++) {
                this.form[inputs[i].name] = inputs[i].value;
                if(inputs[i].name === 'object'){
                    this.object = inputs[i].value.charAt(0).toUpperCase() + inputs[i].value.slice(1);
                }

                if(inputs[i].name === 'fields'){
                    if(inputs[i].value.includes(',')){
                        this.fields = inputs[i].value.split(',');
                    }else{
                        this.fields.push(inputs[i].value);
                    }
                }
            }
            this.loaded = true;
            this.generated = true;
        }
    }

    formError(){
        this.loaded = false;
        this.notifyUser('Error', 'Form error!', 'error');
        this.generated = false;
    }

    formLoaded(){
        this.loaded = false;
    }

    get formtitle(){
        return 'New ' + this.object;
    }

    formCancel(){
        this.generated = false;
    }

    formSuccess(){
        this.notifyUser('Success', 'Record save successfully!', 'success');
    }

    notifyUser(title, message, variant){
        const notif = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(notif);
    }
}