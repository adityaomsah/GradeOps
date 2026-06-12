# vision_extractor.py
# Goal: take an image path, return transcribed handwritten text as a string

import torch, json, re 
from PIL import Image
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor, BitsAndBytesConfig


bnb_config = BitsAndBytesConfig(
    load_in_4bit = True,
    bnb_4bit_quant_type = "nf4",
    bnb_4bit_compute_dtype = torch.float16,
    bnb_4bit_use_double_quant = True
)
model = Qwen2VLForConditionalGeneration.from_pretrained(
    "Qwen/Qwen2-VL-2B-Instruct",
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True
)


VLMprocessor = AutoProcessor.from_pretrained(
    "Qwen/Qwen2-VL-2B-Instruct"
)

def text_from_image(img_path : str) -> dict:
    try:
        image = Image.open(img_path).convert("RGB")
    except Exception as e:
        return {"name": None, "roll_no": None, "raw_text": f"ERROR: {str(e)}"}

    message_list = [
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                },
                {
                    "type" : "text",
                    "text": (
                        "You are an OCR system.\n"
                        "Read ALL handwritten and printed text exactly as written.\n"
                        "Do not summarize.\n"
                        "Do not correct spelling.\n"
                        "Extract student name and roll number if visible.\n\n"
                        "Return ONLY valid JSON:\n"
                        "{\n"
                        '  "name": "<student name or null>",\n'
                        '  "roll_no": "<roll number or null>",\n'
                        '  "raw_text": "<full OCR transcription>"\n'
                        "}"
                    )
                }
            ],
        }
    ]

    prepared_message = VLMprocessor.apply_chat_template(
        message_list,
        tokenize=False,
        add_generation_prompt=True
    )

    inputs = VLMprocessor(
        text=[prepared_message],
        images=[image],
        padding=True,
        return_tensors="pt"
    )

    inputs = {
        k: v.to("cuda")
        for k, v in inputs.items()
    }

    try:

        with torch.inference_mode():

            generated_ids = model.generate(
                **inputs,
                max_new_tokens=256,
                do_sample=False,
                temperature=0
            )

        generated_ids_trimmed = [
            output_ids[len(input_ids):]
            for input_ids, output_ids
            in zip(inputs.input_ids, generated_ids)
        ]

        output_text = VLMprocessor.batch_decode(
            generated_ids_trimmed,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False
        )

        output_string_raw = "".join(output_text).strip()

        try:

            cleaned = re.sub(
                r"^```(?:json)?\s*|\s*```$",
                "",
                output_string_raw,
                flags=re.DOTALL
            ).strip()

            result = json.loads(cleaned)

            return {
                "name": result.get("name"),
                "roll_no": result.get("roll_no"),
                "raw_text": result.get("raw_text")
            }

        except json.JSONDecodeError:

            return {
                "name": None,
                "roll_no": None,
                "raw_text": output_string_raw
            }

    except Exception as e:

        return {
            "name": None,
            "roll_no": None,
            "raw_text": f"MODEL ERROR: {str(e)}"
        }


if __name__ == "__main__":

    result = text_from_image(
        "D:/AIML/GradeOPsProject/GradeOps/backend/ocr/images/Pdf1_page_2.png"
    )

    print("\n----------------------------")
    print("Name    :", result.get("name"))
    print("Roll No :", result.get("roll_no"))
    print("Text    :")
    print(result.get("raw_text"))
    print("----------------------------")