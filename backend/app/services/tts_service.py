import urllib.request
import urllib.parse
import hashlib
import json
import os
from datetime import datetime
import random
import time
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class NanoAITTS:
    """TTS service for generating speech from text using NanoAI API"""
    
    def __init__(self, cache_file: str = "robots.json"):
        self.name = "纳米AI"
        self.id = "bot.n.cn"
        self.author = "TTS Server"
        self.icon_url = "https://bot.n.cn/favicon.ico"
        self.version = 2
        self.ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        self.voices: Dict[str, Dict[str, str]] = {}
        self.cache_file = cache_file
        self.load_voices()
    
    def md5(self, msg: str) -> str:
        """Generate MD5 hash"""
        return hashlib.md5(msg.encode("utf-8")).hexdigest()
    
    def _e(self, nt: str) -> int:
        """Generate hash value"""
        HASH_MASK_1 = 268435455
        HASH_MASK_2 = 266338304
        
        at = 0
        for i in range(len(nt) - 1, -1, -1):
            st = ord(nt[i])
            at = ((at << 6) & HASH_MASK_1) + st + (st << 14)
            it = at & HASH_MASK_2
            if it != 0:
                at = at ^ (it >> 21)
        return at
    
    def generate_unique_hash(self) -> int:
        """Generate unique hash"""
        lang = "zh-CN"
        app_name = "chrome"
        ver = 1.0
        platform = "Win32"
        width = 1920
        height = 1080
        color_depth = 24
        referrer = "https://bot.n.cn/chat"
        
        nt = f"{app_name}{ver}{lang}{platform}{self.ua}{width}x{height}{color_depth}{referrer}"
        at = len(nt)
        it = 1
        while it:
            nt += str(it ^ at)
            it -= 1
            at += 1
        
        return (round(random.random() * 2147483647) ^ self._e(nt)) * 2147483647
    
    def generate_mid(self) -> str:
        """Generate MID (message ID)"""
        domain = "https://bot.n.cn"
        rt = str(self._e(domain)) + str(self.generate_unique_hash()) + str(
            int(time.time() * 1000) + random.random() + random.random()
        )
        formatted_rt = rt.replace(".", "e")[:32]
        return formatted_rt
    
    def get_iso8601_time(self) -> str:
        """Get current time in ISO8601 format"""
        now = datetime.now()
        return now.strftime("%Y-%m-%dT%H:%M:%S+08:00")
    
    def get_headers(self) -> Dict[str, str]:
        """Generate request headers"""
        device = "Web"
        ver = "1.2"
        timestamp = self.get_iso8601_time()
        access_token = self.generate_mid()
        zm_ua = self.md5(self.ua)
        
        zm_token_str = f"{device}{timestamp}{ver}{access_token}{zm_ua}"
        zm_token = self.md5(zm_token_str)
        
        return {
            "device-platform": device,
            "timestamp": timestamp,
            "access-token": access_token,
            "zm-token": zm_token,
            "zm-ver": ver,
            "zm-ua": zm_ua,
            "User-Agent": self.ua,
        }
    
    def http_get(self, url: str, headers: Dict[str, str]) -> str:
        """Send GET request using standard library"""
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return response.read().decode("utf-8")
        except Exception as e:
            logger.error(f"HTTP GET request failed: {e}")
            raise Exception(f"HTTP GET request failed: {e}")
    
    def http_post(self, url: str, data: str, headers: Dict[str, str]) -> bytes:
        """Send POST request using standard library"""
        data_bytes = data.encode("utf-8")
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return response.read()
        except Exception as e:
            logger.error(f"HTTP POST request failed: {e}")
            raise Exception(f"HTTP POST request failed: {e}")
    
    def load_voices(self) -> None:
        """Load voice list from cache or API"""
        try:
            if os.path.exists(self.cache_file):
                logger.info(f"Loading voices from cache file: {self.cache_file}")
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            else:
                logger.info("Fetching voices from API")
                response_text = self.http_get(
                    "https://bot.n.cn/api/robot/platform", self.get_headers()
                )
                data = json.loads(response_text)
                with open(self.cache_file, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
            
            # Clear old voice list
            self.voices.clear()
            if data and "data" in data and data["data"] and "list" in data["data"]:
                for item in data["data"]["list"]:
                    self.voices[item["tag"]] = {
                        "name": item["title"],
                        "iconUrl": item["icon"],
                    }
            if self.voices:
                logger.info(f"Loaded {len(self.voices)} voices")
            else:
                logger.warning("No voices loaded from API response, using default")
                self.voices["DeepSeek"] = {"name": "DeepSeek (Default)", "iconUrl": ""}
        except Exception as e:
            logger.error(f"Failed to load voice list: {e}")
            self.voices.clear()
            # Add default option if network request fails
            self.voices["DeepSeek"] = {"name": "DeepSeek (Default)", "iconUrl": ""}
    
    def get_audio(self, text: str, voice: str = "DeepSeek") -> bytes:
        """Get audio data from TTS API"""
        url = f"https://bot.n.cn/api/tts/v1?roleid={voice}"
        
        headers = self.get_headers()
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        
        form_data = f"&text={urllib.parse.quote(text)}&audio_type=mp3&format=stream"
        
        try:
            audio_data = self.http_post(url, form_data, headers)
            logger.info(f"Generated audio for text: {text[:50]}... with voice: {voice}")
            return audio_data
        except Exception as e:
            logger.error(f"Failed to get audio: {e}")
            raise
