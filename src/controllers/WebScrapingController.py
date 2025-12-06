from .BaseController import BaseController
import requests
from bs4 import BeautifulSoup
from typing import Dict
import logging

logger = logging.getLogger('uvicorn.error')

class Website:
    """Helper class to scrape and parse website content"""
    
    def __init__(self, url: str):
        self.url = url
        response = requests.get(url, timeout=10)
        self.body = response.content
        soup = BeautifulSoup(self.body, 'html.parser')
        self.title = soup.title.string if soup.title else "No title found"
        
        if soup.body:
            for irrelevant in soup.body(['script', 'style', 'input', 'img']):
                irrelevant.decompose()
            self.text = soup.body.get_text(separator='\n', strip=True)
        else:
            self.text = soup.get_text(separator='\n', strip=True)

    def get_content(self) -> str:
        return f"website title:\n {self.title}\n webpage content: \n {self.text}\n\n"


class WebScrapingController(BaseController):
    """Controller for web scraping and summarization operations"""
    
    def __init__(self, generation_client=None, template_parser=None):
        super().__init__()
        self.generation_client = generation_client
        self.template_parser = template_parser

    def summarize_website(self, company_name: str, url: str) -> str:
        """
        Scrape a website and generate a summary
        
        Args:
            company_name: Name of the company
            url: URL of the website to scrape
            
        Returns:
            Generated summary text
        """
        if not self.generation_client:
            raise ValueError("Generation client not initialized")
        
        try:
            # Scrape the website
            logger.info(f"Scraping website: {url}")
            website = Website(url)
            
            # Construct the prompt - using the same pattern as NLPController
            system_prompt = (
                "You are an assistant that analyzes the contents of a company website landing page "
                "and creates a detailed brochure about the content for prospective customers. "
                "Respond in markdown."
            )
            
            # Get system prompt from template parser if available
            if self.template_parser:
                try:
                    custom_prompt = self.template_parser.get("web_summary", "system_prompt")
                    if custom_prompt:  # Only use if not None
                        system_prompt = custom_prompt
                        logger.info("Using custom system prompt from template parser")
                    else:
                        logger.info("Template returned None, using default system prompt")
                except Exception as e:
                    logger.warning(f"Could not get template: {e}, using default")
            
            # Construct the user prompt
            user_prompt = (
                f"Please generate a brochure for the content about {company_name}. "
                f"Here is their landing page:\n\n{website.get_content()}"
            )
            
            # Construct chat history - SAME WAY AS NLPController
            chat_history = [
                self.generation_client.construct_prompt(
                    prompt=system_prompt,
                    role=self.generation_client.enums.SYSTEM.value,
                )
            ]
            
            logger.info("Generating brochure")
            
            # Generate the summary - SAME WAY AS NLPController
            summary = self.generation_client.generate_text(
                prompt=user_prompt,
                chat_history=chat_history
            )
            
            if not summary:
                raise ValueError("Generation client returned empty summary")
            
            logger.info("Summary generated successfully")
            return summary
            
        except Exception as e:
            logger.error(f"Error in summarize_website: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise