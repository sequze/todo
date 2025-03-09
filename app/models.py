import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db
from datetime import datetime, timezone
from flask_login import UserMixin
from typing import Optional


class User(UserMixin, db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(20), index=True,
                                                unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(60), index=True,
                                              unique=True)
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(sa.String(256))
    tasks: so.Mapped[list['Task']] = so.relationship(
        back_populates='user', cascade="all, delete-orphan"
    )
    folders: so.Mapped[list['Folder']] = so.relationship(
        back_populates='user', cascade="all, delete-orphan"
    )


class Folder(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64))
    body: so.Mapped[Optional[str]] = so.mapped_column(sa.String(140))
    user: so.Mapped['User'] = so.relationship(
        back_populates='folders'
    )
    tasks: so.Mapped[list['Task']] = so.relationship(
        back_populates='folder', cascade="all, delete-orphan"
    )
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("user.id"))


class Task(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64))
    body: so.Mapped[Optional[str]] = so.mapped_column(sa.String(140))
    timestamp: so.Mapped[datetime] = so.mapped_column(
        index=True, default=lambda: datetime.now(timezone.utc))
    user: so.Mapped['User'] = so.relationship(
        back_populates='tasks'
    )
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("user.id"))  # Добавляем ForeignKey
    folder_id: so.Mapped[Optional[int]] = so.mapped_column(
        sa.ForeignKey(Folder.id), nullable=True)  # Папка может быть пустой
    folder: so.Mapped[Optional['Folder']] = so.relationship(
        back_populates='tasks',
    )
    is_completed: so.Mapped[bool] = so.mapped_column(default=False)
