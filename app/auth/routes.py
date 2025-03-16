from app.auth import auth
from app.models import User
from app import db
from flask import render_template, flash, redirect, url_for, request
from app.forms import LoginForm, RegistrationForm
from flask_login import login_user, current_user, logout_user
import sqlalchemy as sa
from urllib.parse import urlsplit

@auth.route("/login", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = db.session.scalar(sa.select(User).where(User.username == form.username.data))
        if user is None or not user.check_password(form.password.data):
            flash("Invalid username or password")
            return redirect(url_for("auth.login"))
        login_user(user, remember=form.remember_me.data)
        next = request.args.get("next")
        if not next or urlsplit(next).netloc != "":
            next = url_for("main.index")
        return redirect(next)
    return render_template("login.html", form=form)


@auth.route('/logout')
def logout():
    logout_user()
    return(redirect(url_for('main.index')))


@auth.route('/register', methods=["GET", "POST"])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        return redirect(url_for("auth.login"))
    return render_template("register.html", form=form)