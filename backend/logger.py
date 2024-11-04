import logging
from rich.console import Console
from rich.logging import RichHandler


class AppLogger:
    _logger = None

    def __new__(cls, *args, **kwargs):
        if cls._logger is None:
            cls._logger = super(AppLogger, cls).__new__(cls, *args, **kwargs)
            cls._initialize_logger()
        return cls._logger

    @classmethod
    def _initialize_logger(cls):
        cls._logger_instance = logging.getLogger(__name__)
        cls._logger_instance.setLevel(logging.DEBUG)
        console_handler = RichConsoleHandler()
        cls._logger_instance.addHandler(console_handler)

    def get_logger(self):
        return self._logger_instance


class RichConsoleHandler(RichHandler):
    def __init__(self, width=200, style=None, **kwargs):
        super().__init__(
            console=Console(color_system="256", width=width, style=style), **kwargs
        )

# Uso
logger = AppLogger().get_logger()
logger.info("Logger configurado com sucesso.")
