
function buildTaskElement(taskId, taskName){
    let taskItem = document.createElement('div');
    taskItem.style = "display: flex; align-items: center; justify-content: space-between;";
    taskItem.className = "task-item";
    taskItem.innerHTML = `
    <li id="task` + taskId + `"><input type="checkbox" id="taskCheckbox` + taskId +`"> ` + taskName + ` </li>                    <button type="button" style="border: none;background: transparent;" data-bs-toggle="dropdown" aria-expanded="false"> : </button>
    <ul class="dropdown-menu">
        <li><button class="dropdown-item task-delete" id="taskDelete` + taskId + `">Удалить</button></li>
        <li><button class="dropdown-item task-edit" id="taskEdit` + taskId + `">Редактировать</button></li>
    </ul>
    `;
    checkbox = taskItem.querySelector("input");
    checkbox.addEventListener('change', () => {
        complete_task(task_id);
    });
    taskItem.querySelector(".task-delete").addEventListener('click', () => delete_task(taskId));
    taskItem.querySelector(".task-edit").addEventListener('click', () => edit_task(taskId));
    return taskItem;
}


window.onload = function(){
    async function delete_task(task_id){
        try {
            task = document.getElementById("task" + task_id).parentElement;
            const res = await fetch("/delete_task", {
                method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "task_id": task_id,
                        })
            })
    
            const data = await res.json()
    
            if (data.success){
                task.remove();
            }
            else{
                alert("Error: " + data.error);
            }
        } catch(error) {
            console.error("Error", error)
        }
    }
    function createEditForm(text){
        const form = document.createElement('form');  
        form.classList.add('edit-folder-form');
        const input = document.createElement('input');  
        input.type = 'text';
        input.classList.add("form-control")
        input.value = text;
        const saveButton = document.createElement('button');  
        saveButton.textContent = '✅';  
        saveButton.className = "btn btn-light btn-sm";
        saveButton.type = 'submit';  
        const cancelButton = document.createElement('button');  
        cancelButton.textContent = '❌';  
        cancelButton.className = "btn btn-light btn-sm cancel-button";
        cancelButton.type = 'button'; // Важно, чтобы не отправлял форму  
        form.appendChild(input);  
        form.appendChild(saveButton);  
        form.appendChild(cancelButton);
        form.style = "display: flex; gap: 10px; align-items: center;";
        return form;
    }
    async function edit_task(task_id){
        task = document.getElementById("task" + task_id);
        taskName = task.textContent.trim();
        form = createEditForm(taskName);
        input = form.querySelector(".form-control");
        cancelButton = form.querySelector(".cancel-button");
        task.replaceWith(form);
        form.addEventListener("submit", async(event) => {
            event.preventDefault();
            let newName = input.value.trim();
            if (newName && newName != taskName){
                try{
                    const res = await fetch("/edit_task", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "task_id": task_id,
                            "name": newName
                        })
                    })
                    const data = await res.json();
                    if (data.success){
                        newTask = document.createElement("li");
                        newTask.id = "task" + task_id;
                        newTask.innerHTML = `
                        <input type="checkbox" id="taskCheckbox` + task_id + `"> ` + newName.trim();
                        newTask.querySelector("input").addEventListener('change', () => {
                            complete_task(task_id);
                        });
                        form.replaceWith(newTask);
                    }
                    else{
                        alert("Error: " + data.error);
                        form.replaceWith(task);
                    }
                } catch(error){
                    console.error("Error", error);
                }
            }
            else{
                form.replaceWith(task);
            }
        })
        cancelButton.addEventListener('click', () => {
            form.replaceWith(task);
        })

    }
    async function complete_task(task_id){
        checkbox = document.getElementById("taskCheckbox" + task_id);
        try{
            res = await fetch('/complete_task',{
                method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "task_id": task_id
                    })
            })
            data = await res.json();
            if (data.success){
                if (checkbox.checked){
                    folder_id = data.folder_id;
                    task = document.getElementById("task" + task_id).parentElement;
                    taskList = document.getElementById("task-list" + folder_id);
                    taskList.removeChild(task);
                    if (document.getElementById("task-completed-list" + folder_id) == null){
                        finished_tasks = document.createElement("div");
                        finished_tasks.style = "display: flex; align-items: center;";
                        finished_tasks.class = "finished_tasks";
                        finished_tasks.innerHTML = `
                        <span>▸</span>
                        <button class="btn btn-light btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#hiddenFolder` + folder_id + `" aria-expanded="false" aria-controls="hiddenFolder` + folder_id + `">
                            Выполненные задачи
                        </button>
                        `;

                        hidden_tasks = document.createElement("div");
                        hidden_tasks.className = "collapse";
                        hidden_tasks.id = "hiddenFolder" + folder_id;
                        hidden_tasks.innerHTML = `
                            <div class="card card-body" id="task-completed-list` + folder_id + `"></div>
                        `;
                        document.getElementById("folder" + folder_id).appendChild(finished_tasks);
                        document.getElementById("folder" + folder_id).appendChild(hidden_tasks);
                    }
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
        } catch(error){
            console.error("Error" + error);
            checkbox.checked = false;
        }
    }

    async function add_btn(folder_id) {
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
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            let input = document.getElementById("task-name" + folder_id);
            let taskName = input.value.trim();
            if (!taskName) {
                alert("Task name cannot be empty!");
                return;
            }
            try{
                res = await fetch('/add_task', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "taskName": taskName,
                        "folder_id": folder_id
                    })
                })
                data = await res.json();
                if (data.success){
                    task_id = data.task_id;
                    taskItem = buildTaskElement(task_id, taskName)
                    document.getElementById("task-list" + folder_id).appendChild(taskItem);
                    newTask.remove();
                    button.style.pointerEvents = "auto";

                }
                else{
                    alert("Error: " + data.error);
                }
            } catch(error){
                console.error("Error", error);
        }
    })
    }
    async function add_folder() {
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
        form.addEventListener('submit', async function(event){
            console.log("adding new folder...");
            event.preventDefault();
            input = document.getElementById("add-folder");
            folderName = input.value.trim();
            if (!folderName){
                alert("Folder name can`t be empty!");
                return;
            }
            try {
                res = await fetch("/add_folder", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "folderName": folderName
                    })
                })

                data = await res.json();
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
            } catch(error) {
                console.error("Error", error);
            }
            });
    }
    

    //функции для редактирования и удаления папки
    async function delete_folder(folder_id){
        try{
            res = await fetch("/delete_folder", {
                method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "folder_id": folder_id
                    })
            })
            data = await res.json();
            if (data.success){
                document.getElementById("folder" + folder_id).closest(".folder-column").remove();
            } else {
                alert("Error: " + data.error);
            }
        } catch(error) {
            console.error("Error", error);
            alert("An error occurred while deleting the folder.");
        }
    }

    async function edit_folder(folder_id) {
        folder = document.getElementById("folder" + folder_id);
        folderName = folder.querySelector("h5");
        folderHead = folder.firstElementChild;
        const form = createEditForm(folderName.textContent);
        folderHead.replaceWith(form);
        input = form.querySelector(".form-control");
        cancelButton = form.querySelector(".cancel-button");
        
        form.addEventListener("submit", async(event) => {
            event.preventDefault();
            let newName = input.value;
            if (newName && newName != folderName){
                try{
                res = await fetch("/edit_folder", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "folder_id": folder_id,
                        "name": newName
                    })
                })
                data = await res.json();
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
                } catch(error){
                     console.error("Error", error);
                }
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