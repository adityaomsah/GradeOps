#this is the code for converting the pdf that is uploaded to a folder of images for the VLM to operate on
#using the pdf2image library to convert the pdf to png 

from pdf2image import convert_from_path
import os

def pdf_to_image(pdf_path: str, output_save_folder: str, pdf_name: str) -> list:   #good coding practice remember in future codes too
    images = convert_from_path(pdf_path)

    current_directory = os.getcwd()
    final_save = os.path.join(current_directory, output_save_folder)
    os.makedirs(final_save, exist_ok= True)

    image_paths = []
    for i,image in enumerate(images):
        file_name = f"{pdf_name}page{i+1}.png"
        full_path = os.path.join(final_save, file_name)
        image.save(full_path, "PNG")
        image_paths.append(full_path)
        print(f"page {i+1}/{len(images)} saved!!")

    return image_paths

if __name__ == "__main__":
    pdf_to_image("D:/AIML/GradeOPsProject/GradeOps/backend/ocr/Testpdf.pdf", "backend/ocr/images", pdf_name = "Pdf1")

