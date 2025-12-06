from pydantic import BaseModel, Field
from typing import Optional

class HREmailRequest(BaseModel):
    email_type: str = Field(..., description="Type of email: 'offer_letter', 'rejection', 'interview_invitation', 'onboarding', 'performance_review', 'termination', 'reminder', 'announcement', 'appreciation', 'custom'")
    recipient_name: str = Field(..., description="Name of the recipient")
    context: str = Field(..., description="Additional context or details for the email")
    tone: Optional[str] = Field("professional", description="Tone of the email: 'professional', 'friendly', 'formal'")
    
    class Config:
        schema_extra = {
            "example": {
                "email_type": "interview_invitation",
                "recipient_name": "John Doe",
                "context": "Position: Senior Software Engineer, Date: January 15th, 2024, Time: 2:00 PM, Location: Virtual via Zoom",
                "tone": "professional"
            }
        }