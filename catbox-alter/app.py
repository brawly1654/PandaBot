from fastapi import FastAPI, Request, File, UploadFile
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles


app = FastAPI()
app.mount("/static", StaticFiles(directory="uploads"), name="uploads")
templates = Jinja2Templates(directory="/data/data/com.termux/files/home/whatsapp-botchill/catbox-alter/templates")

@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", context={"request": request})

@app.get("/upload/{file}", response_class=FileResponse)
async def get_upload_page(request: Request, file: str):
    return FileResponse(f"uploads/{file}")

@app.post("/upload", response_class=RedirectResponse)
async def upload_file(request: Request, file: UploadFile = File(...)):
    content = await file.read()
    with open(f"uploads/{file.filename}", "wb") as f:
        f.write(content)
    return RedirectResponse(url=f"/upload/{file.filename}", status_code=303)
