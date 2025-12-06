from .BaseController import BaseController
import logging

logger = logging.getLogger('uvicorn.error')

class HREmailController(BaseController):
    """Controller for HR email generation"""
    
    def __init__(self, generation_client=None, template_parser=None):
        super().__init__()
        self.generation_client = generation_client
        self.template_parser = template_parser
        
        # Email type templates
        self.email_templates = {
            "offer_letter": {
                "description": "Job offer letter",
                "prompt_template": "Create a professional job offer letter for {recipient_name}. Include: {context}"
            },
            "rejection": {
                "description": "Rejection email after interview",
                "prompt_template": "Create a respectful rejection email for {recipient_name}. Context: {context}"
            },
            "interview_invitation": {
                "description": "Interview invitation email",
                "prompt_template": "Create an interview invitation email for {recipient_name}. Details: {context}"
            },
            "onboarding": {
                "description": "New employee onboarding email",
                "prompt_template": "Create an onboarding email for new employee {recipient_name}. Include: {context}"
            },
            "performance_review": {
                "description": "Performance review invitation",
                "prompt_template": "Create a performance review invitation email for {recipient_name}. Details: {context}"
            },
            "termination": {
                "description": "Employment termination letter",
                "prompt_template": "Create a professional termination letter for {recipient_name}. Context: {context}"
            },
            "reminder": {
                "description": "General reminder email",
                "prompt_template": "Create a reminder email for {recipient_name}. About: {context}"
            },
            "announcement": {
                "description": "Company or team announcement",
                "prompt_template": "Create an announcement email for {recipient_name}. Announcement: {context}"
            },
            "appreciation": {
                "description": "Employee appreciation email",
                "prompt_template": "Create an appreciation email for {recipient_name}. Context: {context}"
            },
            "custom": {
                "description": "Custom email",
                "prompt_template": "Create an HR email for {recipient_name}. Requirements: {context}"
            }
        }

    def generate_email(self, email_type: str, recipient_name: str, context: str, tone: str = "professional") -> str:
        """
        Generate an HR email based on the type and context
        
        Args:
            email_type: Type of email to generate
            recipient_name: Name of the recipient
            context: Additional context and details
            tone: Tone of the email (professional, friendly, formal)
            
        Returns:
            Generated email content
        """
        if not self.generation_client:
            raise ValueError("Generation client not initialized")
        
        try:
            # Validate email type
            if email_type not in self.email_templates:
                raise ValueError(f"Invalid email type: {email_type}. Valid types: {', '.join(self.email_templates.keys())}")
            
            logger.info(f"Generating {email_type} email for {recipient_name}")
            
            # Get tone description
            tone_descriptions = {
                "professional": "professional and polite",
                "friendly": "warm and friendly while maintaining professionalism",
                "formal": "very formal and official"
            }
            tone_desc = tone_descriptions.get(tone, "professional and polite")
            
            # Construct the system prompt
            system_prompt = (
                f"You are an expert HR professional who writes clear, empathetic, and {tone_desc} emails. "
                f"Generate well-structured emails that are concise, respectful, and include all necessary information. "
                f"Format the email with proper subject line, greeting, body, and closing using **Markdown**. "
                f"**IMPORTANT: Output ONLY the email content.** DO NOT include any introductory/closing phrases, explanatory text, or **Markdown code fences** (e.g., ```markdown, ```json)."
                f"\n\n--- EXPECTED OUTPUT FORMAT EXAMPLE ---\n"
                f"**Subject:** Your Subject Here\n\n"
                f"Dear [Recipient Name],\n\n"
                f"This is the main body of the email. Please use paragraphs and **bold** formatting for emphasis where appropriate.\n\n"
                f"Sincerely,\n"
                f"HR Team"
            )
            
            # Get custom system prompt from template parser if available
            if self.template_parser:
                try:
                    custom_prompt = self.template_parser.get("hr_email", "system_prompt")
                    if custom_prompt:
                        # If a custom prompt is found, it overrides the default system_prompt completely
                        system_prompt = custom_prompt
                        logger.info("Using custom system prompt from template parser")
                    else:
                        logger.info("Template returned None, using default system prompt")
                except Exception as e:
                    logger.warning(f"Could not get template: {e}, using default")
            
            # Get the specific template for this email type
            template = self.email_templates[email_type]
            
            # Construct the user prompt
            user_prompt = template["prompt_template"].format(
                recipient_name=recipient_name,
                context=context
            )
            user_prompt += f"\n\nTone: {tone_desc}"
            
            # Construct chat history
            chat_history = [
                self.generation_client.construct_prompt(
                    prompt=system_prompt,
                    role=self.generation_client.enums.SYSTEM.value,
                )
            ]
            
            logger.info("Generating email content")
            
            # Generate the email
            email_content = self.generation_client.generate_text(
                prompt=user_prompt,
                chat_history=chat_history
            )
            
            if not email_content:
                raise ValueError("Generation client returned empty email content")
            
            # Since the model is now strictly instructed not to use fences, 
            # we rely on it, but we strip surrounding whitespace just in case.
            email_content = email_content.strip()
            
            logger.info("Email generated successfully")
            return email_content
            
        except Exception as e:
            logger.error(f"Error in generate_email: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise
    
    def get_available_email_types(self):
        """
        Get list of available email types with descriptions
        
        Returns:
            Dictionary of email types and their descriptions
        """
        return {
            email_type: template["description"]
            for email_type, template in self.email_templates.items()
        }