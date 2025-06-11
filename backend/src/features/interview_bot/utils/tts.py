import soundfile as sf
# from kokoro import KPipeline
# import numpy as np
# import torch
import sounddevice as sd
# device = "cuda" if torch.cuda.is_available() else "cpu"
# print(f"Using device: {device}")
# pipeline = KPipeline(lang_code='a',device=device)
 
# def text_to_speech(text, voice="af_heart", speed=1.2):
    
#     generator = pipeline(text, voice=voice, speed=speed)
#     audio_output =[]
#     for i, (gs, ps, audio) in enumerate(generator):
#         print(f"Generating segment {i}...")
#         print("Text:", gs)
#         print("Phonemes:", ps)

        
#         audio_output.append(audio)

#     combined_audio = np.concatenate(audio_output)
#     sf.write("output.wav", combined_audio, 24000)
#     
#     return "output.wav"
        

from murf import Murf
import requests
client = Murf(
    api_key="ap2_de614dcc-fdee-4ce7-a9f7-4d2b08e32854" # Not required if you have set the MURF_API_KEY environment variable
)
def text_to_speech(text, filename="uploads/output.wav"):
    res = client.text_to_speech.generate(
        text=text,
        voice_id="en-US-terrell"
    )
    
    audio_url = res.audio_file
    print("Downloading audio file from:", audio_url)
    response = requests.get(audio_url)

    if response.status_code == 200:
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"Audio file saved as {filename}")
        
        # ✅ Correct way to play audio
        data, samplerate = sf.read(filename)
        sd.play(data, samplerate)
        sd.wait()  # Wait for playback to complete
    else:
        print("Failed to download the audio file. Status code:", response.status_code)

    return filename

