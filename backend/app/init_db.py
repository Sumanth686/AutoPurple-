from app.models.models import Base
from app.core.database import engine

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully")

if __name__ == "__main__":
    init_db()
