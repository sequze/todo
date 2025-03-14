from app.auth import auth
from flask import render_template

@auth.route("/login")
def login():
    ...