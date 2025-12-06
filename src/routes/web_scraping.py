from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse
from routes.schemes.web_scraping import WebScrapingRequest
from controllers import WebScrapingController
from models import ResponseSignal
import logging

logger = logging.getLogger('uvicorn.error')

web_scraping_router = APIRouter(
    prefix="/api/v1/web-scraping",
    tags=["api_v1", "web_scraping"],
)

@web_scraping_router.post("/summarize")
async def summarize_website(request: Request, scrape_request: WebScrapingRequest):
    """
    Scrape a website and generate a summary using the generation client
    """
    try:
        web_scraping_controller = WebScrapingController(
            generation_client=request.app.generation_client,
            template_parser=request.app.template_parser
        )
        
        summary = web_scraping_controller.summarize_website(
            company_name=scrape_request.company_name,
            url=scrape_request.url
        )
        
        return JSONResponse(
            content={
                "signal": ResponseSignal.WEB_SUMMARY_SUCCESS.value,
                "summary": summary
            }
        )
    except Exception as e:
        logger.error(f"Error summarizing website: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "signal": ResponseSignal.WEB_SUMMARY_ERROR.value,
                "error": str(e)
            }
        )