from typing import Any, Dict, List, Optional, Union
from langchain.callbacks.base import BaseCallbackHandler
from langchain.schema import AgentAction, AgentFinish, LLMResult

class CallbackHandler(BaseCallbackHandler):
    
    """Custom CallbackHandler."""
    def __init__(self, queue):
        super().__init__()
        self.queue = queue

    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> None:
        print("============ Start ==================")
        pass

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        print("============ End ==================")
        pass

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        self.queue.put(token)
        print('\033[36m' + token + '\033[0m')

    def on_llm_error(
        self, error: Union[Exception, KeyboardInterrupt], **kwargs: Any
    ) -> None:
        """Do nothing."""
        pass
  