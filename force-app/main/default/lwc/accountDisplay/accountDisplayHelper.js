import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class AccountDisplayHelper {

    static showResult = ({message, forRefresh, variant='warning'}, thisArg) => {
        if (forRefresh) {
            refreshApex(forRefresh);
        }
        thisArg.dispatchEvent(
            new ShowToastEvent({
                title: variant.toUpperCase(),
                message,
                variant: variant
            })
        );    

    }

    static updateCounters(thisArg) {
        thisArg.draftsCnt = thisArg.drafts.length;
        thisArg.modifiedCnt = thisArg.modified.length;
    }

    static clearSelections(thisArg) {
        thisArg.drafts = [];
        thisArg.modified = [];
        thisArg.selectedRows = [];
        this.updateCounters(thisArg);
    }    

    static createTagMatcher({account, objectType = 'account', mode = 'find'}) {
        return (parameter) => {
            const fieldToCompare = objectType === 'account' ? parameter.tag : parameter;
            return mode === 'find' ? fieldToCompare === account.tag : fieldToCompare !== account.tag
        };
    }
}