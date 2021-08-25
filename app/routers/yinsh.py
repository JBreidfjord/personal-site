from app.yinsh.web.helpers import (
    get_outcome,
    handle_bot,
    handle_bot_row,
    handle_dsts,
    handle_place,
    handle_play,
    handle_ring,
    handle_row,
    parse_data,
    parse_play_data,
)
from fastapi import APIRouter, HTTPException, Request
from fastapi.requests import Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates

router = APIRouter(prefix="/yinsh")

templates = Jinja2Templates(directory="app/yinsh/web/templates")


@router.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@router.post("/bot", response_class=JSONResponse)
async def bot(request: Request):
    data = await request.json()
    _, game = parse_data(data)
    response_data = handle_bot(game)
    return JSONResponse(response_data)


@router.post("/bot-row", response_class=JSONResponse)
async def bot_row(request: Request):
    data = await request.json()
    _, game = parse_data(data)
    response_data = handle_bot_row(game)
    return JSONResponse(response_data)


@router.post("/place", response_class=JSONResponse)
async def place(request: Request):
    data = await request.json()
    response_data = handle_place(*parse_data(data))
    if response_data is None:
        raise HTTPException(409, "Action not valid for given state")
    return JSONResponse(response_data)


@router.post("/play-src", response_class=JSONResponse)
async def play_src(request: Request):
    data = await request.json()
    response_data = handle_dsts(*parse_data(data))
    if response_data is None:
        raise HTTPException(409, "Action not valid for given state")
    return JSONResponse(response_data)


@router.post("/play-dst", response_class=JSONResponse)
async def play_dst(request: Request):
    data = await request.json()
    response_data = handle_play(*parse_play_data(data))
    if response_data is None:
        raise HTTPException(409, "Action not valid for given state")
    return JSONResponse(response_data)


@router.post("/row", response_class=JSONResponse)
async def row(request: Request):
    data = await request.json()
    response_data = handle_row(data)
    if response_data is None:
        raise HTTPException(409, "Action not valid for given state")
    return JSONResponse(response_data)


@router.post("/ring", response_class=JSONResponse)
async def ring(request: Request):
    data = await request.json()
    response_data = handle_ring(*parse_data(data))
    if response_data is None:
        raise HTTPException(409, "Action not valid for given state")
    return JSONResponse(response_data)


@router.post("/outcome", response_class=JSONResponse)
async def outcome(request: Request):
    data = await request.json()
    _, game = parse_data(data)
    response_data = get_outcome(game)
    if response_data is None:
        raise HTTPException(409, "Game not over")
    return JSONResponse(response_data)
