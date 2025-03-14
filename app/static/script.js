window.onload = function(){
    function delete_task(task_id){
        task = document.getElementById("task" + task_id).parentElement;
        fetch("/delete_task", {
            method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "task_id": task_id,
                    })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success){
                task.remove();
            }
            else{
                alert("Error: " + data.error);
            }
        })
        .catch(error => console.error("Error", error));
    }
    function edit_task(task_id){
        task = document.getElementById("task" + task_id);
        const form = document.createElement('form');  
        form.classList.add('edit-folder-form'); // Добавим класс для стилизации  
        taskName = task.childNodes[1].nodeValue.trim();
                // Создаем кнопки
        const input = document.createElement('input');  
        input.type = 'text';
        input.classList.add("form-control")
        input.value = taskName;  

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
        task.replaceWith(form);
        form.addEventListener("submit", async(event) => {
            event.preventDefault();
            let newName = input.value;
            if (newName && newName != taskName){
                fetch("/edit_task", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "task_id": task_id,
                        "name": newName
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success){
                        newTask = document.createElement("li");
                        newTask.id = "task" + task_id;
                        newTask.innerHTML = `
                        <input type="checkbox" id="taskCheckbox` + task_id + `"> ` + newName;
                        form.replaceWith(newTask);
                    }
                    else{
                        alert("Error: " + data.error);
                        form.replaceWith(task);
                    }
                })
                .catch(error => console.error("Error", error));
            }
            else{
                form.replaceWith(task);
            }
        })
        cancelButton.addEventListener('click', () => {
            form.replaceWith(task);
        })

    }
    function complete_task(task_id){
        checkbox = document.getElementById("taskCheckbox" + task_id);
        fetch('/complete_task',{
            method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "task_id": task_id
                })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success){
                if (checkbox.checked){
                    task = document.getElementById("task" + task_id).parentElement;
                    taskList = document.getElementById("task-list" + data.folder_id);
                    taskList.removeChild(task);
                    
                    // taskName = task.textContent;
                    // task.remove();
                    // finishedTask = document.createElement("li");
                    // finishedTask.className = "task-item";
                    // finishedTask.innerHTML = `<input type="checkbox" id="taskCheckbox`+ task_id +`" checked>` + taskName;
                    document.getElementById("task-completed-list" + data.folder_id).appendChild(task);  
                }
                else{
                    task = document.getElementById("task" + task_id).parentElement;
                    taskList = document.getElementById("task-completed-list" + data.folder_id);
                    taskList.removeChild(task);
                    document.getElementById("task-list" + data.folder_id).appendChild(task);  
            } 
            }
            else{
                alert("Error" + data.error);
                checkbox.checked = false;
            }
        })
        .catch(error => {
            console.error("Error" + error);
            checkbox.checked = false;
        }
        );
    }


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
                    let taskItem = document.createElement('div');
                    task_id = data.task_id;
                    taskItem.style = "display: flex; align-items: center; justify-content: space-between;";
                    taskItem.className = "task-item";
                    //taskItem.innerHTML = `<input type="checkbox" id="taskCheckbox` + data.task_id + `">` + taskName;
                    taskItem.innerHTML = `
                    <li id="task` + task_id + `"><input type="checkbox" id="taskCheckbox` + task_id +`"> ` + taskName + ` </li>
                    <button type="button" style="border: none;background: transparent;" data-bs-toggle="dropdown" aria-expanded="false"> : </button>
                    <ul class="dropdown-menu">
                        <li><button class="dropdown-item task-delete" id="taskDelete` + task_id + `">Удалить</button></li>
                        <li><button class="dropdown-item task-edit" id="taskEdit` + task_id + `">Редактировать</button></li>
                    </ul>
                    `;
                    checkbox = taskItem.querySelector("input");
                    checkbox.addEventListener('change', () => {
                        complete_task(data.task_id);
                    });
                    document.getElementById("task-list" + folder_id).appendChild(taskItem);
                    newTask.remove();
                    taskItem.querySelector(".task-delete").addEventListener('click', () => delete_task(task_id));
                    taskItem.querySelector(".task-edit").addEventListener('click', () => edit_task(task_id));
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
                    <div class="folder" id="folder` + folder_id + `">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <h5 style="display: inline-block;">` + folderName + `</h5>
                            <div class="dropdown">
                                <button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"></button>
                                <ul class="dropdown-menu">
                                  <li><button class="dropdown-item" id="folderDelete`+ folder_id + `">Удалить</button></li>
                                  <li><button class="dropdown-item" id="folderEdit` + folder_id + `">Редактировать</button></li>
                                </ul>
                            </div>
                        </div>
                        <a href="#" class="add-task" id="button` + folder_id + `">➕ Добавить задачу</a>
                        <ul class="task-list mt-2" id = "task-list` + folder_id + `">
                        </ul>
                    </div>
                    `;
                    createFolderInterface.remove();
                    folderList.appendChild(folderItem);
                    button.style.pointerEvents = "auto";
                    b = folderItem.querySelector(".add-task");
                    b.addEventListener('click', () => add_btn(folder_id));
                    let btn_edit = document.getElementById("folderEdit" + folder_id);
                    btn_edit.addEventListener('click', () => edit_folder(folder_id));
                    let btn_delete = document.getElementById("folderDelete" + folder_id);
                    btn_delete.addEventListener('click', () => delete_folder(folder_id));
                }
                else{
                    alert("Error: " + data.error);
                }
            })
            .catch(error => console.error("Error", error));
            });
    }
    

    //функции для редактирования и удаления папки
    function delete_folder(folder_id){
        fetch("/delete_folder", {
            method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "folder_id": folder_id
                })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success){
                document.getElementById("folder" + folder_id).closest(".folder-column").remove();
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(error => {
            console.error("Error", error);
            alert("An error occurred while deleting the folder.");
        });
    }

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
                        document.getElementById("folderDelete" + folder_id).addEventListener('click', () => delete_folder(folder_id));
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
                let button_delete = document.getElementById("folderDelete" + folder);
                button_delete.addEventListener('click', () => delete_folder(folder));
            }
        }
        else{
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Error", error));
    document.querySelectorAll('.task-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            let taskId = checkbox.id.replace("taskCheckbox", "");
            complete_task(taskId);
        });
    });
    document.querySelectorAll('.task-edit').forEach(button => 
        button.addEventListener('click', () => {
            let taskId = button.id.replace("taskEdit", "");
            edit_task(taskId);
        })
    )
    document.querySelectorAll(".task-delete").forEach(button =>
        button.addEventListener('click', () => {
            let taskId = button.id.replace("taskDelete", "");
            delete_task(taskId);
        })
    )
    
}