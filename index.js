/* jshint esversion: 8 */


// ----------------- Todo List ----------------- //

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const LOCAL_STORAGE_KEY = 'todoList';

function saveToLocalStorage(todos) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
}

function getFromLocalStorage() {
    const todos = localStorage.getItem(LOCAL_STORAGE_KEY);
    return todos ? JSON.parse(todos) : [];
}

function renderTodoItem(text) {
    const todoItem = document.createElement('li');
    
    const todoText = document.createElement('span');
    todoText.innerText = text;
    todoItem.appendChild(todoText);

    const okButton = document.createElement('button');
    okButton.innerText = 'OK';
    okButton.style.display = 'none';
    todoItem.appendChild(okButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.style.display = 'none';
    todoItem.appendChild(deleteButton);

    todoText.addEventListener('dblclick', () => {
        todoText.style.display = 'none';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = todoText.innerText;
        input.className = 'todo-input';
        todoItem.insertBefore(input, todoText);

        okButton.style.display = 'inline';
        deleteButton.style.display = 'inline';
        input.focus();
    });

    okButton.addEventListener('click', () => {
        const newText = todoItem.querySelector('.todo-input').value;
        if (newText) {
            const todos = getFromLocalStorage();
            const index = todos.indexOf(todoText.innerText);
            todos[index] = newText;
            saveToLocalStorage(todos);
            todoText.innerText = newText;
        }
        todoItem.removeChild(todoItem.querySelector('.todo-input'));
        todoText.style.display = 'inline';
        okButton.style.display = 'none';
        deleteButton.style.display = 'none';
    });

    deleteButton.addEventListener('click', () => {
        const todos = getFromLocalStorage();
        const index = todos.indexOf(todoText.innerText);
        todos.splice(index, 1);
        saveToLocalStorage(todos);
        todoList.removeChild(todoItem);
    });

    todoItem.addEventListener('click', (e) => {
        if (e.target !== okButton && e.target !== deleteButton) {
            todoItem.classList.toggle('completed');
        }
    });

    todoItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const todos = getFromLocalStorage();
        const index = todos.indexOf(todoText.innerText);
        todos.splice(index, 1);
        saveToLocalStorage(todos);
        todoList.removeChild(todoItem);
    });

    todoList.appendChild(todoItem);
}

function addTodo(text) {
    const todos = getFromLocalStorage();

    // Check if the item already exists in the list
    if (todos.includes(text)) {
        return;
    }

    renderTodoItem(text);

    todos.push(text);
    saveToLocalStorage(todos);
}


todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (todoInput.value.trim()) {
        addTodo(todoInput.value.trim());
        todoInput.value = '';
    }
});

function loadTodos() {
    const todos = getFromLocalStorage();
    todos.forEach(todo => renderTodoItem(todo));
}

document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
});


// ----------------- Background Image API ----------------- //

fetch("https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature")
    .then(res => res.json())
    .then(data => {
        document.body.style.backgroundImage = `url(${data.urls.full})`;
		document.getElementById("author").textContent = `By: ${data.user.name}`;
    })
    .catch(err => {
        // Use a default background image/author
        document.body.style.backgroundImage = `url(https://images.unsplash.com/photo-1560008511-11c63416e52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyMTEwMjl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2MjI4NDIxMTc&ixlib=rb-1.2.1&q=80&w=1080)`;
		document.getElementById("author").textContent = `By: Dodi Achmad`;
});

// ----------------- Current Time ----------------- //

function getCurrentTime() {
    const date = new Date();
    document.getElementById("time").textContent = date.toLocaleTimeString("de", {timeStyle: "short"});
}

setInterval(getCurrentTime, 1000);

// ----------------- Weather API ----------------- //

navigator.geolocation.getCurrentPosition(position => {
    fetch(`https://apis.scrimba.com/openweathermap/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=imperial`)
        .then(res => {
            if (!res.ok) {
                throw Error("Weather data not available");
            }
            return res.json();
        })
        .then(data => {
            let degreeInCelsius = (Math.round(data.main.temp) - 32) * 5 / 9;
            const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
            document.getElementById("weather").innerHTML = `
                <img src=${iconUrl} />
                <p class="weather-temp">${Math.round(degreeInCelsius)}<span class="degree-symbol">º</span></p>
                <p class="weather-city">${data.name}</p>
            `;
        })
        .catch(err => console.error(err));
});

// ----------------- Browser Bookmarks ----------------- //

function extractWebsiteName(url) {
    const parsedUrl = new URL(url);
    const hostnameParts = parsedUrl.hostname.split('.');
    const domain = hostnameParts.length > 1 ? hostnameParts[hostnameParts.length - 2] : hostnameParts[0];
    return domain;
}

chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    let bookmarks = bookmarkTreeNodes[0].children[0].children;
    
    // Map the bookmarks to a new array with title, url, and favicon properties
    let bookmarkInfo = bookmarks.map(bookmark => ({
        title: bookmark.title,
        url: bookmark.url,
        favicon: `https://www.google.com/s2/favicons?domain=${bookmark.url}`
    }));

    bookmarkInfo.forEach(bookmark => 
        document.getElementById('bookmarks').innerHTML += `
    <a href='${bookmark.url}'>
        <div class='bookmark'>
                <img class="icon" src="${bookmark.favicon}">
                <p>${extractWebsiteName(bookmark.url)}</p>  
        </div>
    </a>
    `);
});


  
