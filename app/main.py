from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


def compound_interest(wealth: float, rate: float, contrib: float, years: int):
    assert years > 0 and wealth >= 0.0
    wealth = (wealth + contrib) * (1 + rate)
    if years == 1:
        return wealth
    return compound_interest(wealth, rate, contrib, years - 1)


@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
