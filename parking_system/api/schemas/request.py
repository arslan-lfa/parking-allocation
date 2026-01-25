from pydantic import BaseModel, Field


class SubmitRequestSchema(BaseModel):
    vehicle_id: str = Field(..., example="V123")
    preferred_zone_id: str = Field(..., example="Z1")


class ReleaseRequestSchema(BaseModel):
    request_id: str = Field(..., example="req-uuid")


class RollbackSchema(BaseModel):
    k: int = Field(..., ge=1, example=1)
