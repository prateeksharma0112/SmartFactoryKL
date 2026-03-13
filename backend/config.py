import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# AAS Server URLs
AAS_BASE_URL = os.getenv('AAS_BASE_URL')
AAS_SHELLS_URL = os.getenv('AAS_SHELLS_URL')

# Submodel IDs
BOM_ID = os.getenv('BOM_ID')
NAMEPLATE_ID = os.getenv('NAMEPLATE_ID')
PRODUCTION_ORDERS_ID = os.getenv('PRODUCTION_ORDERS_ID')

# CORS settings
CORS_ORIGINS = os.getenv("CORS_ORIGINS").split(",")