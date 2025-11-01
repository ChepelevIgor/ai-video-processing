import sys
import subprocess
import shutil
import os
import io
import logging

# =============================
# 🎬 Video Enhancement Script
# =============================

# Настройка консоли для корректного вывода Unicode
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Настройка логирования
logging.basicConfig(level=logging.INFO, format='%(message)s')

# Проверка аргументов
if len(sys.argv) < 3:
    logging.error("❌ Usage: python enhance_script.py <input_path> <output_path>")
    sys.exit(1)

INPUT_VIDEO = sys.argv[1]
OUTPUT_VIDEO = sys.argv[2]

# Проверка существования файла
if not os.path.exists(INPUT_VIDEO):
    logging.error(f"❌ Input file not found: {INPUT_VIDEO}")
    sys.exit(1)

# Проверка ffmpeg
if not shutil.which("ffmpeg"):
    raise EnvironmentError("❌ ffmpeg not found in PATH")

# Лог
logging.info("🚀 Starting video enhancement...")
logging.info(f"Input: {INPUT_VIDEO}")
logging.info(f"Output: {OUTPUT_VIDEO}")

# FFmpeg фильтры: denoise + sharpness + color adjustment
ffmpeg_command = [
    "ffmpeg", "-y",
    "-i", INPUT_VIDEO,
    "-vf",
    "hqdn3d=3:3:6:6,unsharp=5:5:1.0:5:5:0.0,eq=contrast=1.2:brightness=0.05:saturation=1.1",
    "-c:a", "copy",
    OUTPUT_VIDEO
]

try:
    subprocess.run(ffmpeg_command, check=True)
    logging.info(f"✅ Video successfully enhanced: {OUTPUT_VIDEO}")
    sys.exit(0)
except subprocess.CalledProcessError:
    logging.error("❌ Error during video enhancement")
    sys.exit(1)
