
from common.exceptions import CustomError
import requests
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logging.debug("Starting step 3")
    requests.post("https://webhook.site/86ffa910-d177-4b03-8c4e-9f2e8e730344", {
        "comment": "step_3"
    })
    
    # raise CustomError("Failed to perform step 3")
    
    event["input"]["step_3"] = "Done"
    
    logging.debug("Step 2 has been completed")
    
    return event