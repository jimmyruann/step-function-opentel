
import logging
import requests

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    
    logging.debug("Starting step 4")
    
    requests.post("https://webhook.site/86ffa910-d177-4b03-8c4e-9f2e8e730344", {
        "comment": "step_4"
    })
    
    event["input"]["step_4"] = "Done"
    
    logging.debug("Step 2 has been completed")
    
    return event