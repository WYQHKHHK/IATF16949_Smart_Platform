import pdfplumber
import os

pdf_path = r'D:\antigravity-skills\agent files\IATF16949_Smart_Platform\IATF-Rules-6th-Edition_Sanctioned-Interpretations-November-2025-CN.pdf'

if not os.path.exists(pdf_path):
    print(f"Error: File not found at {pdf_path}")
    exit(1)

with pdfplumber.open(pdf_path) as pdf:
    text = ""
    for page in pdf.pages:
        text += f"\n\n--- Page {page.page_number} ---\n\n"
        text += page.extract_text() or ""
    
    with open("pdf_text_output.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("Successfully extracted text to pdf_text_output.txt")
