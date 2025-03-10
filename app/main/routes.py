from flask import render_template, request, make_response, jsonify
from app.main import main
from app.models import Task, Folder
from app import db
import sqlalchemy as sa
import sqlalchemy.orm as so
@main.route("/")
@main.route("/index")
def index():
    folders = (
        db.session.query(Folder)
        .options(so.joinedload(Folder.tasks))
        .filter(Folder.user_id == 1)
        .all()
    )
    folders_indexes = [i.id for i in folders]
    return render_template('index.html', folders=folders, f_ind=folders_indexes)


@main.route("/add_task", methods=["POST"])
def add_task():
    # TODO: сделать проверку айди папки
    data = request.get_json()
    task_name = data.get("taskName")
    folder_id = data.get("folder_id")

    if not folder_id:
        return make_response(jsonify(success=False, error="Please Enter folder id!"))
    if not task_name:
        return make_response(jsonify(success=False, error="Please Enter task name!"))

    user_id = db.session.scalar(sa.select(Folder).where(Folder.id == folder_id)).user_id
    t = Task(name=task_name, user_id=user_id, folder_id=folder_id)
    db.session.add(t)
    db.session.commit()
    res = make_response(jsonify({"success": True}), 200)
    return res

@main.route("/add_folder", methods=["POST"])
def add_folder():
    #TODO: сделать для юзера
    #TODO: добавить возможность описания папки
    #TODO: проверить, нет ли ошибок при работе с бд
    data = request.get_json()
    folder_name = data.get("folderName")
    if not folder_name:
        return make_response(jsonify(sucess=False, error="Please enter folder name!"))
    f = Folder(name=folder_name, user_id=1)
    db.session.add(f)
    db.session.commit()
    folder_id = db.session.scalar(sa.select(Folder).where(Folder.name==folder_name)).id
    print(folder_id)
    if not folder_id:
        return make_response(jsonify(sucess=False, error="Database Error"))
    return make_response(jsonify(success=True, folder_id=folder_id), 200)


@main.route("/get_folders", methods=["POST"])
def get_folders():
    #TODO получать айди пользователя и фильтровать по нему
    data = request.get_json()
    user_id = data.get("user_id", 1)
    indexes = [f.id for f in db.session.query(Folder).filter(Folder.user_id == user_id).all()]
    return make_response(jsonify(success=True, folders=indexes))


@main.route("/edit_folder", methods=["POST"])
def edit_folder():
    data = request.get_json()
    folder_id = data.get("folder_id")
    new_name = data.get("name")
    if not folder_id:
        return make_response(jsonify(sucess=False, error="Please enter folder id"))
    if not new_name:
        return make_response(jsonify(sucess=False, error="Please enter new folder name"))
    folder = db.session.scalar(sa.select(Folder).where(Folder.id==folder_id))
    folder.name = new_name
    db.session.commit()
    return make_response(jsonify(success=True))


@main.route("/delete_folder", methods=["POST"])
def delete_folder():
    data = request.get_json()
    folder_id = data.get("folder_id")
    if not folder_id:
        return make_response(jsonify(sucess=False, error="Please enter folder id"))
    db.session.delete(db.session.scalar(sa.select(Folder).where(Folder.id == folder_id)))
    db.session.commit()
    return make_response(jsonify(success=True))

@main.route("/complete_task", methods=["POST"])
def complete_task():
    data = request.get_json()
    task_id = data.get("task_id")
    if not task_id:
        return make_response(jsonify(success=False, error="Please enter task_id"))
    task = db.session.scalar(sa.select(Task).where(Task.id == task_id))
    folder_id = task.folder_id
    if not folder_id: 
        return make_response(jsonify(success=False, error="folder not found!"))
    task.is_completed = not task.is_completed
    db.session.commit()
    return make_response(jsonify(success=True, folder_id=folder_id))