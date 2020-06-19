/* eslint-disable no-console */
import { createElement } from 'lwc';
import AccountEditor from 'c/accountEditor';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { registerTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
// Mock realistic data
const mockCurrentPageReference = require('./data/CurrentPageReference.json');

const currentPageReferenceAdapter = registerTestWireAdapter(CurrentPageReference);

jest.mock('c/pubsub', () => {
    return {
        registerListener: jest.fn(),
        unregisterAllListeners: jest.fn(),
        fireEvent: jest.fn()
    };
});


describe('Draft Account Create/Edit', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    beforeAll(() => {
        const  accountEditor = createElement('c-account-editor', { is: AccountEditor});
        document.body.appendChild(accountEditor);
        currentPageReferenceAdapter.emit(mockCurrentPageReference);       
        
        // Validate if pubsub got registered after connected to the DOM
        expect(registerListener.mock.calls.length).toBe(1);
        expect(registerListener.mock.calls[0][0]).toEqual('editAccount');
    });

    afterAll(() => {
        const accountEditor = document.body.querySelector('c-account-editor');
        document.body.removeChild(accountEditor);

        // Validate if pubsub got unregistered after disconnected from the DOM
        document.body.removeChild(accountEditor);
        expect(unregisterAllListeners.mock.calls.length).toBe(1); 
    });

    test('Test default fields', () => {
        const accountEditor = document.body.querySelector('c-account-editor');
        const recordEditForm = accountEditor.shadowRoot.querySelector('lightning-record-edit-form');
        // const buttons = accountEditor.shadowRoot.querySelectorAll('lightning-button');
        
        const inputFields = accountEditor.shadowRoot.querySelectorAll('lightning-input-field');
        let nameField;
        inputFields.forEach(inField => {
            if (inField.fieldName === 'Name') {
                nameField = inField;
            }
        });
        expect(inputFields.length).toBeGreaterThan(0);

        return Promise.resolve()
        .then(() => {
            console.log(`inputFields ${inputFields}`);
            nameField.value = 'Account 1';

            recordEditForm.dispatchEvent(new CustomEvent('submit', {
                detail: {
                    fields: [...inputFields]
                }
            }))


        })
        .then(() => {
            expect(fireEvent).toHaveBeenCalled();
        });
    });

});