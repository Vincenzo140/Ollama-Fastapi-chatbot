"""Application logging configured with Rich for readable console output."""

from __future__ import annotations

import logging

from rich.console import Console
from rich.logging import RichHandler


class RichConsoleHandler(RichHandler):
    """RichHandler with a preconfigured wide console."""

    def __init__(self, width: int = 200, style: str | None = None, **kwargs: object) -> None:
        super().__init__(
            console=Console(color_system="256", width=width, style=style),
            rich_tracebacks=True,
            **kwargs,
        )


_configured = False


def setup_logging(level: int = logging.INFO) -> None:
    """Configure the root logger once with a Rich console handler."""
    global _configured
    if _configured:
        return
    logging.basicConfig(
        level=level,
        format="%(message)s",
        datefmt="[%X]",
        handlers=[RichConsoleHandler()],
    )
    _configured = True


def get_logger(name: str = "app") -> logging.Logger:
    """Return a logger, ensuring logging is configured."""
    setup_logging()
    return logging.getLogger(name)
