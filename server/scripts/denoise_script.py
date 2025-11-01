import sys
import os
import subprocess
import shutil
import torchaudio
import torch
import numpy as np
from pyrnnoise import RNNoise

INPUT_VIDEO = sys.argv[1]
OUTPUT_VIDEO = sys.argv[2]

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

TEMP_AUDIO = os.path.join(UPLOAD_DIR, "temp_audio.wav")
DENOISED_AUDIO = os.path.join(UPLOAD_DIR, "denoised.wav")
SAMPLE_RATE = 48000

def write_wav(path: str, arr: np.ndarray, sr: int):
    arr = arr.astype(np.float32)
    if arr.ndim == 1:
        arr = arr[None, :]
    torchaudio.save(path, torch.from_numpy(arr), sr)

def pyrnnoise_denoise(y: np.ndarray, sr: int) -> np.ndarray:
    if y.ndim > 1:
        y = y.mean(axis=0)
    if sr != 48000:
        y = torchaudio.functional.resample(torch.from_numpy(y), sr, 48000).numpy()
    denoiser = RNNoise(sample_rate=48000)
    y_chunk = y[np.newaxis, :]
    out = denoiser.denoise_chunk(y_chunk)
    out_audio = np.concatenate([chunk for (_, chunk) in out], axis=1).ravel()
    if sr != 48000:
        out_audio = torchaudio.functional.resample(torch.from_numpy(out_audio), 48000, sr).numpy()
    out_audio = out_audio / (np.max(np.abs(out_audio)) + 1e-12)
    return out_audio.astype(np.float32)

def run_ffmpeg(cmd):
    try:
        result = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(result.stdout.decode())
        return True
    except subprocess.CalledProcessError as e:
        print("FFmpeg error:", e.stderr.decode())
        raise

def main(input_video, output_video):
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg not found in PATH")

    # Extract audio
    run_ffmpeg([
        "ffmpeg", "-y", "-i", input_video,
        "-vn", "-ac", "1",
        "-ar", str(SAMPLE_RATE),
        "-acodec", "pcm_f32le",  # более устойчивый вариант
        TEMP_AUDIO
    ])

    waveform, sr = torchaudio.load(TEMP_AUDIO)
    waveform = waveform.mean(dim=0).numpy()
    waveform /= np.max(np.abs(waveform)) + 1e-12

    denoised = pyrnnoise_denoise(waveform, sr)
    write_wav(DENOISED_AUDIO, denoised, sr)

    # Merge denoised audio back
    run_ffmpeg([
        "ffmpeg", "-y",
        "-i", input_video,
        "-i", DENOISED_AUDIO,
        "-c:v", "copy",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest",
        output_video
    ])

    # Cleanup
    try:
        os.remove(TEMP_AUDIO)
        os.remove(DENOISED_AUDIO)
    except Exception:
        pass

if __name__ == "__main__":
    main(INPUT_VIDEO, OUTPUT_VIDEO)
