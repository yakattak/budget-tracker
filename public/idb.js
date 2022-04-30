let db;

const request = indexedDB.open('budget_tracker', 1);

//create object store
request.onupgradeneeded = function(event) {
    const db = event.target.result;

    db.createObjectStore('new_item', {autoIncrement: true});
};

//on success save reference

request.onsuccess = function(event) {
    db = event.target.result;

    //if online do this

    if(navigator.onLine) {
        //code to come
    };
};

request.onerror = function(event) {
    //log error
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    //open new transaction with read and write permission

    const transaction = db.transaction(['new_item'], 'readwrite');

    //access the object store

    const budgetObjectStore = transaction.objectStore('new_item');

    //add record
    budgetObjectStore.add(record);
}

function uploadItem() {
    //open a transaction
    const transaction = db.transaction(['new_item'], 'readwrite');

    //access object store
    const budgetObjectStore = transaction.objectStore('new_item');

    //get all records and set to variable
    const getAll = budgetObjectStore.getAll();

    //on success execute

    getAll.onsuccess = function(){
        //if there was a stored indexdb send it

        if (getAll.result.length > 0) {
            fetch('api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    "Content-Type": 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse=> {
                if (serverResponse.message) {
                    throw new Error (serverResponse);
                }
                const transaction = db.transaction(['new_item'], 'readwrite');
                //access new item object store
                const budgetObjectStore = transaction.objectStore('new_item');
                //clear all
                budgetObjectStore.clear();
            });
        }
    }

}

// listen for app coming back online
window.addEventListener('online', uploadItem);