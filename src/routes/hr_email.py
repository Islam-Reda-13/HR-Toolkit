from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse
from routes.schemes.hr_email import HREmailRequest
from controllers import HREmailController
from models import ResponseSignal
import logging

logger = logging.getLogger('uvicorn.error')

hr_email_router = APIRouter(
    prefix="/api/v1/hr-email",
    tags=["api_v1", "hr_email"],
)

@hr_email_router.post("/generate")
async def generate_hr_email(request: Request, email_request: HREmailRequest):
    """
    Generate professional HR emails for various scenarios
    """
    try:
        hr_email_controller = HREmailController(
            generation_client=request.app.generation_client,
            template_parser=request.app.template_parser
        )
        
        email_content = hr_email_controller.generate_email(
            email_type=email_request.email_type,
            recipient_name=email_request.recipient_name,
            context=email_request.context,
            tone=email_request.tone
        )
        
        return JSONResponse(
            content={
                "signal": ResponseSignal.HR_EMAIL_SUCCESS.value,
                "email": email_content
            }
        )
    except Exception as e:
        logger.error(f"Error generating HR email: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "signal": ResponseSignal.HR_EMAIL_ERROR.value,
                "error": str(e)
            }
        )