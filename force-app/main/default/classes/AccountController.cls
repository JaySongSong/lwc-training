public with sharing class AccountController {

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountList() {
        return [SELECT Id, AccountUrl__c, Name, Type, Industry, Phone FROM Account ORDER BY LastModifiedDate DESC LIMIT 10 ];
    }

    @AuraEnabled
    public static List<Account> saveDrafts(List<Account> draftAccounts) {
        upsert draftAccounts;
        return [SELECT Id, AccountUrl__c, Name, Type, Industry, Phone FROM Account WHERE Id IN:draftAccounts ORDER BY LastModifiedDate DESC LIMIT 10 ];
    }

    @AuraEnabled
    public static String deleteAccount(Account acc) {
        
        delete acc;
        return acc.Name;
    }    

    @AuraEnabled(cacheable=true)
    public static Account getSingleAccount() {
        return [SELECT Id, Name, Phone, Type FROM Account LIMIT 1];
    }
    
    public with sharing class AccountControllerException extends Exception {}
}
