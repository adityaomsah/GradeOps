#this is the code for converting the pdf that is uploaded to a folder of images for the VLM to operate on
#using the pdf2image library to convert the pdf to png 

from pdf2image import convert_from_path
import os

def pdf_to_image(pdf_path: str, output_save_folder: str) -> list:   #good coding practice
    images = convert_from_path(pdf_path)

    current_directory = os.getcwd()
    final_save = os.path.join(current_directory, output_save_folder)
    os.makedirs(final_save, exist_ok= True)

    for i,image in enumerate(images):
        file_name = f"Image{i+1}.png"
        full_path = os.path.join(final_save, file_name)
        image.save(full_path, "PNG")
        print(f"Image {i+1}/{len(images)} saved!!")


if __name__ == "__main__":
    pdf_to_image("D:/AIML/GradeOPsProject/GradeOps/backend/ocr/Testpdf.pdf", "backend/ocr/images")

