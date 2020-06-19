import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getAccountList from '@salesforce/apex/AccountController.getAccountList';
import saveDrafts from '@salesforce/apex/AccountController.saveDrafts';
import deleteAccount from '@salesforce/apex/AccountController.deleteAccount';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';
import helper from './accountDisplayHelper';

const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'URL', fieldName: 'AccountUrl__c', type: 'url', typeAttributes: {target: '_blank', label:{fieldName:'Id'}} },
    { label: 'Type', fieldName: 'Type'},
    { label: 'Industry', fieldName: 'Industry'},

];


export default class AccountDisplay extends LightningElement {


    accountCreateDefaults;

    @wire(CurrentPageReference) pageRef;

    @track accounts = [];
    @track error;
    @track columns = columns;
    @track draftCount = 0;
    @track isLoading = true;

    drafts = [];
    modified = [];
    @track draftsCnt = 0;
    @track modifiedCnt = 0;
    @track selectedRows;
    wiredAccountsResult;

    @wire(getAccountList)
    wiredAccounts(result) {
        this.wiredAccountsResult = result;
        if (result.data) {
            // recreate object to remove read only closure
            this.accounts = result.data.map(acc => ({...acc, tag : acc.Id }));
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error.body.message;
            this.accounts = undefined;
        }
        this.isLoading = false;
    }

    constructor() {
        super();
        this.columns = [
            ...this.columns,
            { type: 'action', typeAttributes: { rowActions: this.getRowActions } },
        ]
        this.selectedRows = [];
        
    }

    connectedCallback() {
        registerListener('saveAccountDraft', this.handleNewDraft, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    getRowActions(row, doneCallback) {
        const actions = [{ label: 'Delete', name: 'delete' }];
            if (row.Id) {
                actions.push({
                    'label': 'Edit',
                    'iconName': 'action:edit',
                    'name': 'edit'
                });
            } else {
                actions.push({
                    'label': 'Save',
                    'iconName': 'action:upload',
                    'name': 'save'
                });
            }
            
            doneCallback(actions);
            
    }

    handleNewDraft(accountParam) {
        
        const account = JSON.parse(JSON.stringify(accountParam));

        const accountFinder = helper.createTagMatcher({account, objectType: 'account', mode: 'find'});
        const accountFilter = helper.createTagMatcher({account, objectType: 'account', mode: 'filter'});

        account.sobjecttype = 'Account';
        const idx = this.accounts.findIndex(accountFinder);
        this.accounts = [account, ...this.accounts.filter(accountFilter)];

        if (idx !== -1) {
            // handle edit existing records
            this.modified = [account, ...this.modified.filter(accountFilter)];
        } else {
            // if account deleted in Account Display before being saved from Account Editor treat as new Draft Account
            if (account.Id) {
                account.Id = null
                account.AccountUrl__c = null;
            }
            this.drafts.push(account);
            account.tag = ++this.draftCount; // First tag should be 1, 0 is not registering in selected rows
        }

        if (this.selectedRows.findIndex(accountFinder) === -1) {
            this.selectedRows = [account.tag, ...this.selectedRows];
        }
        helper.updateCounters(this);
    }

    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows.map(acc => acc.tag);
    }

    handleSave() {

        const accountsToSave = this.accounts.filter(account => {

            const tagFinder = helper.createTagMatcher({account, objectType: 'tag', mode: 'find'});
            const accountFinder = helper.createTagMatcher({account, objectType: 'account', mode: 'find'});

            return this.selectedRows.findIndex(tagFinder) !== -1 &&
                    (this.drafts.findIndex(accountFinder) !== -1
                    || this.modified.findIndex(accountFinder) !== -1);
            
        });
        if (accountsToSave.length > 0) {
            this.isLoading = true;
            saveDrafts({draftAccounts : accountsToSave})
            .then(accounts => {
                helper.showResult({message:`${accounts.map(acc => acc.Name).toString()} saved`, forRefresh: this.wiredAccountsResult, variant: 'success'}, this);
                helper.clearSelections(this);
            })
            .catch(err => helper.showResult({message: err.message ? err.message : err.body.message, variant: 'error' }, this))
            .finally(() => {this.isLoading = false});
        } else {
            helper.showResult({message: 'No New/Updated Accounts found in selected rows', variant: 'error' }, this);
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const account = JSON.parse(JSON.stringify(event.detail.row));

        const accountFilter = helper.createTagMatcher({account, objectType: 'account', mode: 'filter'});
        const tagFilter = helper.createTagMatcher({account, objectType: 'tag', mode: 'filter'});

        if (actionName === 'delete') {
            let success = true;
            if (account.Id) {
                this.isLoading = true;
                deleteAccount({acc : account})
                    .catch(err => {
                        success = false;
                        helper.showResult({ message: err.message, variant: 'error' }, this);
                    })
                    .finally(() => {this.isLoading = false});

            }

            if (success) {

                try {
                    this.accounts = this.accounts.filter(accountFilter);
                    this.drafts = this.drafts.filter(accountFilter);
                    this.modified = this.modified.filter(accountFilter);

                    helper.updateCounters(this);
                    helper.showResult({message:`${account.Name} deleted`, forRefresh: this.accounts.length <= 0 ? this.wiredAccountsResult : undefined }, this);
                } catch (err) {
                    helper.showResult({ message: err.message, variant: 'error' }, this)
                }
            }

        } else if (actionName === 'save') {
            this.isLoading = true;

            saveDrafts({draftAccounts : [account]})
                .then(accounts => {        

                    // remove from selected rows
                    this.selectedRows = this.selectedRows.filter(tagFilter);

                    // remove from drafts
                    this.drafts = this.drafts.filter(accountFilter);
                    helper.updateCounters(this);

                    // update display
                    const updatedAcc = accounts[0];
                    updatedAcc.sobjecttype = 'Account';
                    updatedAcc.tag = updatedAcc.Id;
                    this.accounts = [updatedAcc, ...this.accounts.filter(accountFilter)];

                    // show toast
                    helper.showResult({message:`${accounts.map(accRec => accRec.Name).toString()} saved`, variant: 'success'}, this);

                })
                .catch(err => helper.showResult({message: err.message, variant: 'error' }, this))
                .finally(() => {this.isLoading = false});
        } else if (actionName === 'edit') {
            // pubsub event
            fireEvent(this.pageRef, 'editAccount', account);
        }


    }    
}

