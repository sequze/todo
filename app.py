from app import create_app,db
import sqlalchemy as sa
import sqlalchemy.orm as so
from app.models import User, Folder, Task
app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
    

@app.shell_context_processor
def make_shell_context():
    return {'sa': sa, 'so': so, 'db': db, 'Task': Task, 'User': User, 'Folder': Folder}
