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
    #TODO: сделать проверку айди папки
    data = request.get_json()
    task_name = data.get("taskName")
    folder_id = data.get("folder_id")
    
    if not folder_id:
        return make_response(jsonify(success=False, error="Please Enter folder_id!"))
    if not task_name:
        return make_response(jsonify(success=False, error="Please Enter task name!"))
    
    user_id = db.session.scalar(sa.select(Folder).where(Folder.id == folder_id)).user_id
    t = Task(name=task_name, user_id=user_id, folder_id=folder_id)
    db.session.add(t)
    db.session.commit()
    res = make_response(jsonify({"success": True}), 200)
    return res