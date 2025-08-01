"""
Neemee Backend - Personal Knowledge Management System

This package contains the core components for processing web highlights
and building personal knowledge graphs from captured content.
"""

__version__ = "0.1.0"
__author__ = "Paul Bonneville Labs"
__description__ = "Personal knowledge management through web highlight processing"

from .config import get_settings, get_config

__all__ = ["get_settings", "get_config"]