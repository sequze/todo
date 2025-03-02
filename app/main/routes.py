from flask import render_template
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
