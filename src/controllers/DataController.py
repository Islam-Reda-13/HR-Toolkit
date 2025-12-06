from .BaseController import BaseController
from .ProjectController import ProjectController
from fastapi import UploadFile
from models import ResponseSignal
import re
import os

class DataController(BaseController):
    
    def __init__(self):
        super().__init__()
        self.size_scale = 1048576 # convert MB to bytes

    # --- NEW METHOD: Check file extension for validation ---
    def is_file_extension_allowed(self, filename: str):
        """Check if the file extension is one of the allowed types based on settings."""
        if not filename:
            return False
            
        # Extract the extension (e.g., .md, .pdf)
        _, file_extension = os.path.splitext(filename.lower())
        
        # Mapping common file extensions to the allowed content types set in .env
        extension_map = {
            ".txt": "text/plain",
            ".pdf": "application/pdf",
            ".md": "text/markdown",
        }
        
        # Check if the file's expected content type is in the allowed list
        expected_content_type = extension_map.get(file_extension)

        if expected_content_type and expected_content_type in self.app_settings.FILE_ALLOWED_TYPES:
            return True
        
        return False
        
    # --- UPDATED METHOD: Use both content type and extension for validation ---
    def validate_uploaded_file(self, file: UploadFile):

        # Check file type using both Content-Type and file extension
        is_type_valid = file.content_type in self.app_settings.FILE_ALLOWED_TYPES or \
                        self.is_file_extension_allowed(file.filename)

        if not is_type_valid:
            return False, ResponseSignal.FILE_TYPE_NOT_SUPPORTED.value

        if file.size > self.app_settings.FILE_MAX_SIZE * self.size_scale:
            return False, ResponseSignal.FILE_SIZE_EXCEEDED.value

        return True, ResponseSignal.FILE_VALIDATED_SUCCESS.value

    def generate_unique_filepath(self, orig_file_name: str, project_id: str):

        random_key = self.generate_random_string()
        project_path = ProjectController().get_project_path(project_id=project_id)

        cleaned_file_name = self.get_clean_file_name(
            orig_file_name=orig_file_name
        )

        new_file_path = os.path.join(
            project_path,
            random_key + "_" + cleaned_file_name
        )

        while os.path.exists(new_file_path):
            random_key = self.generate_random_string()
            new_file_path = os.path.join(
                project_path,
                random_key + "_" + cleaned_file_name
            )

        return new_file_path, random_key + "_" + cleaned_file_name

    def get_clean_file_name(self, orig_file_name: str):

        # remove any special characters, except underscore and .
        cleaned_file_name = re.sub(r'[^\w.]', '', orig_file_name.strip())

        # replace spaces with underscore
        cleaned_file_name = cleaned_file_name.replace(" ", "_")

        return cleaned_file_name

    def extract_folder_structure(self, filename: str):
        """
        Extract folder structure from filename.
        Some browsers send folder structure in the filename.
        Returns tuple of (folder_path, clean_filename)
        """
        # Replace backslashes with forward slashes for consistency
        filename = filename.replace('\\', '/')
        
        # Split path and get components
        parts = filename.split('/')
        
        if len(parts) > 1:
            folder_path = '/'.join(parts[:-1])
            file_name = parts[-1]
            return folder_path, file_name
        
        return None, filename

    def create_folder_structure(self, project_id: str, folder_path: str):
        """
        Create folder structure within project directory
        """
        project_path = ProjectController().get_project_path(project_id=project_id)
        
        if folder_path:
            full_folder_path = os.path.join(project_path, folder_path)
            os.makedirs(full_folder_path, exist_ok=True)
            return full_folder_path
        
        return project_path

    def generate_unique_filepath_with_structure(self, orig_file_name: str, project_id: str):
        """
        Generate unique filepath preserving folder structure if present
        """
        # Extract folder structure if present
        folder_path, file_name = self.extract_folder_structure(orig_file_name)
        
        # Create folder structure if needed
        if folder_path:
            base_path = self.create_folder_structure(project_id, folder_path)
        else:
            base_path = ProjectController().get_project_path(project_id=project_id)
        
        # Clean the filename
        cleaned_file_name = self.get_clean_file_name(file_name)
        
        # Generate unique filename with random key
        random_key = self.generate_random_string()
        unique_file_name = random_key + "_" + cleaned_file_name
        
        new_file_path = os.path.join(base_path, unique_file_name)
        
        # Ensure uniqueness
        while os.path.exists(new_file_path):
            random_key = self.generate_random_string()
            unique_file_name = random_key + "_" + cleaned_file_name
            new_file_path = os.path.join(base_path, unique_file_name)
        
        # Return path and identifier that includes folder structure
        if folder_path:
            # Reconstruct the file_id with folder path
            file_id = os.path.join(folder_path, unique_file_name).replace('\\', '/')
        else:
            file_id = unique_file_name
        
        return new_file_path, file_id