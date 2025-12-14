from io import BytesIO

async def extract_text_from_file(file):
    content = await file.read()

    if file.filename.lower().endswith(".pdf"):
        import pdfplumber
        text = ""
        with pdfplumber.open(BytesIO(content)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text

    elif file.filename.lower().endswith(".docx"):
        from docx import Document
        doc = Document(BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)

    return ""
