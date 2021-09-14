from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.routers import calculators, supercow, yinsh

app = FastAPI()
app.include_router(calculators.router)
app.include_router(yinsh.router)
app.include_router(supercow.router)

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/calc-static", StaticFiles(directory="app/calculators/static"), name="calc-static")
app.mount("/yinsh-static", StaticFiles(directory="app/yinsh/web/static"), name="yinsh-static")
app.mount("/supercow-static", StaticFiles(directory="app/supercow/static"), name="supercow-static")
templates = Jinja2Templates(directory="templates")


@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
