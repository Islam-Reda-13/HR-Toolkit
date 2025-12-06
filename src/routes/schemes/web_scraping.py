from pydantic import BaseModel, Field

class WebScrapingRequest(BaseModel):
    company_name: str = Field(..., description="Name of the company")
    url: str = Field(..., description="URL of the website to scrape")
    
    class Config:
        schema_extra = {
            "example": {
                "company_name": "Example Corp",
                "url": "https://example.com"
            }
        }