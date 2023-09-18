import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, runTransaction } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://playground-cd5a6-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsmentListInDB = ref(database, "endorsmentList")

const inputFieldEl = document.getElementById("input-field")
const fromFieldEl = document.getElementById("from-field")
const toFieldEl = document.getElementById("to-field")
const publishButtonEl = document.getElementById("publish-button")
const endorsmentListEl = document.getElementById("endorsment-list")

publishButtonEl.addEventListener("click", function() {
    let inputValue = inputFieldEl.value
    let fromValue = fromFieldEl.value
    let toValue = toFieldEl.value
    let heartNumber = 1
    
    const strObj = {
        'endorsment': inputValue,
        'from': fromValue,
        'to': toValue,
        'heart': heartNumber,
        'timestamp': new Date().toISOString(),
    }
    console.log(strObj)
    push(endorsmentListInDB, strObj)
    
    clearInputFieldsEl()
})

function clearInputFieldsEl() {
    inputFieldEl.value = ""
    fromFieldEl.value = ""
    toFieldEl.value = ""
}

onValue(endorsmentListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())
    
        endorsmentListEl.innerHTML = ""
        
        for (let i = 0; i < itemsArray.length; i++) {          
            appendItemToEndorsmentListEl(itemsArray[i][0],itemsArray[i][1]  )
        }    
    } else {
        endorsmentListEl.innerHTML = "No items here... yet"
    }
})

function appendItemToEndorsmentListEl(id, item) {
    const listToEl = document.createElement("p");
    const listFromEl = document.createElement("p");
    const listContentEl = document.createElement("p");
    const listBlockEl = document.createElement("div");
    const listFromLikeEl = document.createElement("div");
    const listCountLikeEl = document.createElement("div");
    const listIconEl = document.createElement("p");
    const listCountEl = document.createElement("p");
    // add the classes
  
    listBlockEl.classList.add("list-block");
    listToEl.classList.add("list-to", "list-header-footer");
    listContentEl.classList.add("list-content");
    listFromLikeEl.classList.add("list-from-like");
    listFromEl.classList.add("list-from", "list-header-footer");
    listCountLikeEl.classList.add("list-count-like");
    listIconEl.classList.add("icon");
    listCountEl.classList.add("count");
  
    //set the content
    listToEl.textContent = item.to;
    listContentEl.textContent = item.endorsment;
    listFromEl.textContent = item.from;
    listIconEl.textContent = "❤️";
    listCountEl.textContent = item.heart;
    listIconEl.disabled = true;

    // Check localStorage for this particular ID
    if (localStorage.getItem(id)) {
    listIconEl.style.pointerEvents = "none";
    listIconEl.style.opacity = "0.5";
    }

    listIconEl.addEventListener("click", function () {
        if (localStorage.getItem(id)) {
        listIconEl.style.pointerEvents = "none";
        listIconEl.style.opacity = "0.5";
        return; // If the ID exists in localStorage, do nothing (icon was already clicked)
        }
        // Get a reference to the specific endorsement you want to update
        const specificEndorsementRef = ref(database, `endorsmentList/${id}`);

        // Use a transaction to safely increment the likes field
        runTransaction(specificEndorsementRef, (currentData) => {
        if (currentData === null) {
            return { heart: 1 }; // if data is null (i.e., doesn't yet exist), initialize it
        } else {
            currentData.heart += 1; // otherwise, increment the current likes count by 1
            return currentData; // return the whole object to avoid overwriting
        }
        })
        .then(() => {
            listCountEl.textContent = Number(listCountEl.textContent) + 1;
        })
        .catch((error) => {
            console.error("Transaction failed: ", error);
        });
        localStorage.setItem(id, true);

        // Optionally disable the icon
        listIconEl.style.pointerEvents = "none";
        listIconEl.style.opacity = "0.5";
    });
  
    // assemble the structure
    listBlockEl.appendChild(listToEl);
    listBlockEl.appendChild(listContentEl);
    listFromLikeEl.appendChild(listFromEl);
    listCountLikeEl.appendChild(listIconEl);
    listCountLikeEl.appendChild(listCountEl);
    listFromLikeEl.appendChild(listCountLikeEl);
    listBlockEl.appendChild(listFromLikeEl);
    if (endorsmentListEl.firstChild) {
        endorsmentListEl.insertBefore(listBlockEl, endorsmentListEl.firstChild);
    } else {
        endorsmentListEl.appendChild(listBlockEl);
    }
  }