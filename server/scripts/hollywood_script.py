import sys
import subprocess
import shutil
import os
import io
import logging

# =============================
# 🎬 Hollywood Video & Audio Enhancement Script (Neutral Tone)
# =============================

# Настройка вывода Unicode
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
logging.basicConfig(level=logging.INFO, format='%(message)s')

# Проверка аргументов
if len(sys.argv) < 3:
    logging.error("❌ Usage: python hollywood_enhance.py <input_path> <output_path>")
    sys.exit(1)

INPUT_VIDEO = sys.argv[1]
OUTPUT_VIDEO = sys.argv[2]

# Проверка файла
if not os.path.exists(INPUT_VIDEO):
    logging.error(f"❌ Input file not found: {INPUT_VIDEO}")
    sys.exit(1)

# Проверка ffmpeg
if not shutil.which("ffmpeg"):
    raise EnvironmentError("❌ ffmpeg not found in PATH")

logging.info("🎬 Starting Hollywood-style enhancement (neutral tone)...")
logging.info(f"Input: {INPUT_VIDEO}")
logging.info(f"Output: {OUTPUT_VIDEO}")

# =============================
# 🎥 Видео фильтры (нейтральный кинематографичный стиль)
# =============================
video_filters = (
    "hqdn3d=4:3:6:6,"  # шумоподавление
    "unsharp=7:7:1.5:7:7:0.0,"  # резкость
    "eq=contrast=1.35:brightness=0.03:saturation=1.15,"  # мягкий контраст и насыщенность
    "curves=r='0/0 0.3/0.28 0.6/0.6 1/1':g='0/0 0.3/0.28 0.6/0.65 1/1':b='0/0 0.3/0.35 0.6/0.7 1/1',"  # холодные средние тона
    "format=yuv420p10le"  # 10-bit цвет для плавных градиентов
)

# =============================
# 🎧 Аудио фильтры (киношный звук)
# =============================
reverb_file = os.path.abspath("reverb.wav")

if os.path.exists(reverb_file):
    reverb_file_ffmpeg = reverb_file.replace("\\", "/")
    audio_filters = (
        "highpass=f=80, "
        "lowpass=f=14000, "
        "acompressor=threshold=-20dB:ratio=3:attack=5:release=100, "
        "loudnorm=I=-14:TP=-1.5:LRA=11, "
        f"afir=dry=1:wet=0.5:file='{reverb_file_ffmpeg}', "
        "volume=1.15"
    )
else:
    logging.warning("⚠️ reverb.wav not found, using cinematic ambience")
    audio_filters = (
        "highpass=f=80, "
        "lowpass=f=14000, "
        "acompressor=threshold=-20dB:ratio=3:attack=5:release=100, "
        "loudnorm=I=-14:TP=-1.5:LRA=11, "
        "aecho=0.8:0.9:30:0.15, "
        "aecho=0.7:0.85:70:0.12, "
        "volume=1.15"
    )

# =============================
# 💻 FFmpeg команда
# =============================
ffmpeg_command = [
    "ffmpeg", "-y",
    "-i", INPUT_VIDEO,
    "-vf", video_filters,
    "-af", audio_filters,
    "-c:v", "libx264", "-preset", "slow", "-crf", "16",
    "-pix_fmt", "yuv420p10le",
    "-c:a", "aac", "-b:a", "256k",
    OUTPUT_VIDEO
]

# =============================
# 🚀 Запуск обработки
# =============================
try:
    subprocess.run(ffmpeg_command, check=True)
    logging.info(f"✅ Hollywood-style video created: {OUTPUT_VIDEO}")
except subprocess.CalledProcessError as e:
    logging.error("❌ Error during enhancement")
    logging.error(e)
    sys.exit(1)
