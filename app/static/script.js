window.onload = function(){
    function add_btn(folder_id) {
        let button = document.getElementById("button" + folder_id);
        button.style.pointerEvents = "none";
        let newTask = document.createElement("li");
        newTask.innerHTML = `
        <form class="task-form">
            <div class="d-flex gap-2">
                <div class="col-md-6">
                    <input type="text" class="form-control" id="task-name` + folder_id + `" placeholder="Task name" required>
                </div>
                <button type="submit" class="btn btn-primary" id="btn` + folder_id + `">Add Task</button>
            </div>
        </form>
        `;

        document.getElementById("task-list" + folder_id).appendChild(newTask);
        let form = newTask.querySelector(".task-form");
        form.addEventListener('submit', function(event) {
            console.log('Привет от JavaScript!');
            event.preventDefault();
            let input = document.getElementById("task-name" + folder_id);
            let taskName = input.value.trim();
            if (!taskName) {
                alert("Task name cannot be empty!");
                return;
            }
            
            fetch('/add_task', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "taskName": taskName,
                    "folder_id": folder_id
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success){
                    let taskItem = document.createElement('li');
                    taskItem.className = "task-item";
                    taskItem.innerHTML = `<input type="checkbox">` + taskName;
                    document.getElementById("task-list" + folder_id).appendChild(taskItem);

                    newTask.remove();
                    button.style.pointerEvents = "auto";
                }
                else{
                    alert("Error: " + data.error);
                }
            })
            .catch(error => console.error("Error", error));
        });
    }
    function add_folder() {
        let button = document.getElementById("new-folder-btn");
        button.style.pointerEvents = "none";
        let folderList = document.getElementById("folder-list");
        let createFolderInterface = document.createElement("div");
        createFolderInterface.className = "folder-column";
        createFolderInterface.innerHTML = `
        <div class="folder">
            <form class="folder-form">
                <div class="d-flex gap-2 align-items-center"> 
                    <input type="text" class="form-control" id="add-folder" placeholder="Folder name" required>
                    <button type="submit" class="btn btn-primary">Add Folder</button>
                </div>
            </form>
        </div>
        `;
        folderList.appendChild(createFolderInterface);
        let form = createFolderInterface.querySelector(".folder-form");
        form.addEventListener('submit', function(event){
            console.log("adding new folder...");
            event.preventDefault();
            input = document.getElementById("add-folder");
            folderName = input.value.trim();
            if (!folderName){
                alert("Folder name can`t be empty!");
                return;
            }
            fetch("/add_folder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "folderName": folderName
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success){
                    let folderItem = document.createElement('div');
                    folderItem.className = "folder-column";
                    let folder_id = data.folder_id;
                    folderItem.innerHTML = `
                    <div class="folder">
                        <h5>` + folderName + ` <a href="#" class="edit-folder">🖊</a></h5>
                        <a href="#" class="add-task" id="button` + folder_id + `">➕ Добавить задачу</a>
                        <ul class="task-list mt-2" id = "task-list` + folder_id + `"></ul>
                    </div>
                    `;
                    createFolderInterface.remove();
                    folderList.appendChild(folderItem);
                    button.style.pointerEvents = "auto";
                    b = folderItem.querySelector(".add-task");
                    b.addEventListener('click', () => add_btn(folder_id));
                }
                else{
                    alert("Error: " + data.error);
                }
            })
            .catch(error => console.error("Error", error));
            });
    }
    

    //функции для редактирования и удаления папки
    
    function edit_folder(folder_id) {
        folder = document.getElementById("folder" + folder_id);
        folderName = folder.querySelector("h5");
        folderHead = folder.firstElementChild;
        const form = document.createElement('form');  
        form.classList.add('edit-folder-form'); // Добавим класс для стилизации  

        // Создаем кнопки
        const input = document.createElement('input');  
        input.type = 'text';
        input.classList.add("form-control")
        input.value = folderName.textContent;  

        const saveButton = document.createElement('button');  
        saveButton.textContent = '✅';  
        saveButton.className = "btn btn-light btn-sm";
        saveButton.type = 'submit';  

        const cancelButton = document.createElement('button');  
        cancelButton.textContent = '❌';  
        cancelButton.className = "btn btn-light btn-sm";
        cancelButton.type = 'button'; // Важно, чтобы не отправлял форму  

        form.appendChild(input);  
        form.appendChild(saveButton);  
        form.appendChild(cancelButton);
        form.style = "display: flex; gap: 10px; align-items: center;";
        folderHead.replaceWith(form);
        
        form.addEventListener("submit", async(event) => {
            event.preventDefault();
            let newName = input.value;
            if (newName && newName != folderName){
                fetch("/edit_folder", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "folder_id": folder_id,
                        "name": newName
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success){
                        newHead = document.createElement("div");
                        newHead.style = "display: flex; align-items: center; justify-content: space-between;";
                        newHead.innerHTML = `
                        <h5 style="display: inline-block;">` + newName +`</h5>
                            <div class="dropdown">
                                <button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"></button>
                                <ul class="dropdown-menu">
                                  <li><button class="dropdown-item" id="folderDelete`+ folder_id +`">Удалить</button></li>
                                  <li><button class="dropdown-item" id="folderEdit`+ folder_id +`">Редактировать</button></li>
                                </ul>
                            </div>
                        `;
                        form.replaceWith(newHead);
                        //newHead.getElementById("folderDelete" + folder_id).addEventListener();
                        document.getElementById("folderEdit" + folder_id).addEventListener('click',() => edit_folder(folder_id));
                    }
                    else{
                        alert("Error: " + data.error);
                        form.replaceWith(folderHead);
                    }
                })
                .catch(error => console.error("Error", error));
            }
            else{
                form.replaceWith(folderHead);
            }
        })
        cancelButton.addEventListener('click', () => {
            form.replaceWith(folderHead);
        })
    }

    document.querySelector(".new-folder-btn").addEventListener('click', add_folder);
    let folders = [];
    fetch("/get_folders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success){
            // Добавляем  слушатели кнопке "Добавить задачу"
            folders = data.folders;
            for (let folder of folders){
                let button = document.getElementById("button" + folder);
                button.addEventListener('click', () => add_btn(folder));
                let button_edit = document.getElementById("folderEdit" + folder);
                button_edit.addEventListener('click', () => edit_folder(folder));
            }
        
            // Добавляем слушатели кнопкам "Удалить и редактировать"

            
        }
        else{
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Error", error));
};