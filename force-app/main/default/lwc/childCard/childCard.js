import { LightningElement, track, api } from 'lwc';

export default class childCard extends LightningElement {
    contacts = [
        {
            Id: '003171931112854375',
            Name: 'Amy Taylor',
            Title: 'VP of Engineering',
            Phone: '6172559632',
            Picture__c:
            'https://s3-us-west-1.amazonaws.com/sfdc-demo/people/amy_taylor.jpg',
        },
        {
            Id: '003192301009134555',
            Name: 'Michael Jones',
            Title: 'VP of Sales',
            Phone: '6172551122',
            Picture__c:
            'https://s3-us-west-1.amazonaws.com/sfdc-demo/people/michael_jones.jpg',
        },
        {
            Id: '003848991274589432',
            Name: 'Jennifer Wu',
            Title: 'CEO',
            Phone: '6172558877',
            Picture__c:
            'https://s3-us-west-1.amazonaws.com/sfdc-demo/people/jennifer_wu.jpg',
        }
    ];

    @track _contacts = [...this.contacts];

    @api
    filterTo(filterQuery){
        const filterClean = filterQuery.toLocaleLowerCase();
        if (filterQuery){
            this._contacts = this.contacts.filter(
                con => con.Name.toLocaleLowerCase().includes(filterClean)
            );
        } else {
            this._contacts = this.contacts;
        }
    }
}