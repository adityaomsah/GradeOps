# vision_extractor.py
# Goal: take an image path, return transcribed handwritten text as a string

import torch
from PIL import Image
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor

model = Qwen2VLForConditionalGeneration.from_pretrained(
    "Qwen/Qwen2-VL-2B-Instruct", 
    torch_dtype = "auto",
    device_map = "auto"
)

VLMprocessor = AutoProcessor.from_pretrained(
    "Qwen/Qwen2-VL-2B-Instruct"
)

def text_from_image(img_path : str) -> str:
    try:
        image = Image.open(img_path).convert("RGB")
    except Exception as e:
        return f"ERROR: Could not open image — {str(e)}"

    message_list = [
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                },
                {
                    "type": "text",
                    "text": "OCR the text in the image."
                }
            ],
        }
    ]

    prepared_message = VLMprocessor.apply_chat_template(
        message_list, tokenize = False, add_generation_prompt = True 
    )

    inputs = VLMprocessor(
        text = [prepared_message], 
        images = [image],
        padding = True,
        return_tensors = "pt",
    )

    inputs = inputs.to("cuda")

    generated_ids = model.generate(**inputs, max_new_tokens=512)
    generated_ids_trimmed = [
        out_ids[len(in_ids) :] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
    ]

    # 4d. decode output and return as plain string
    output_text = VLMprocessor.batch_decode(
        generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
    )
    output_string = "".join(output_text)

    return output_string


# 5. test block (if __name__ == "__main__")
if __name__ == "__main__":
    text_op = text_from_image("D:/AIML/GradeOPsProject/GradeOps/backend/ocr/images/Pdf1_page_2.png")
    print(text_op)
