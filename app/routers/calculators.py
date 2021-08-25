from fastapi import APIRouter
from fastapi.requests import Request
from fastapi.templating import Jinja2Templates

router = APIRouter(prefix="/calculators")

templates = Jinja2Templates(directory="app/calculators/templates")


def compound_interest(wealth: float, rate: float, contrib: float, years: int):
    assert years > 0 and wealth >= 0.0
    wealth = (wealth + contrib) * (1 + rate)
    if years == 1:
        return wealth
    return compound_interest(wealth, rate, contrib, years - 1)


@router.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
