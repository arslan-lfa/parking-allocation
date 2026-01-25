from pydantic import BaseModel


class GenericResponse(BaseModel):
    status: str
    message: str
    data: dict | None = None
