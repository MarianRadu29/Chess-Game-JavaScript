
//NO ZOOM IN/OUT

document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && 
        (event.key === '+' || event.key === '-' || event.key === '0')) {
        event.preventDefault();
    }
});

window.addEventListener('wheel', function(event) {
    if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    let now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

document.addEventListener('gesturestart', function(event) {
    event.preventDefault();
});

document.addEventListener('gesturechange', function(event) {
    event.preventDefault();
});

document.addEventListener('gestureend', function(event) {
    event.preventDefault();
});


//      CHESS GAME

const board = document.getElementById("board");
const container_div = document.getElementById("container");
const squares = document.querySelectorAll('.square');
const checkInputButton = document.getElementById('check');
const buttonRotate = document.getElementById('rotateButton');

const blackCaptureList = document.querySelector('.black-capture-pieces');
const whiteCaptureList = document.querySelector('.white-capture-pieces');

const blackCaptureObjects = [];
const whiteCaptureObjects = [];

//https://www.chess.com/forum/view/general/chessboard-sound-files?page=2#comment-89885805 
const audioGameStart = new Audio('Sounds/game-start.mp3');
const audioMove = new Audio('Sounds/move-self.mp3');
const audioCapture = new Audio('Sounds/capture.mp3');
const audioCheck = new Audio('Sounds/move-check.mp3');
const audioGameEnd = new Audio('Sounds/game-end.mp3');


let autoRotate = false;


const startPieces = [
    /* '', '', '♞', '♛', '♚', '', '', '',
    '♙', '♙', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '♟', '♟', '', '', '', '', '',
    '', '♖', '♘', '', '♕', '', '', '♔', */
      '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜',
    '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟',
    ' ', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙',
    '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'
]
let selectPieceId = -1;
let pawn_w = 0 , rook_w = 0,knight_w = 0,bishop_w = 0;
let pawn_b = 8 , rook_b = 2,knight_b = 2,bishop_b = 2;//sa iau descrescator,cand intorc tabla sa vede invers(negru este sus si este invers fata de alb)
const boardObjects = [];//treb sa contina 64 de elemente

//retin id-urile pieselor
const PiecesWhite = [];
const PiecesBlack = [];
const orderWhite = ['♔', '♕', '♗', '♘', '♖', '♙'];
const orderBlack = ['♚','♛', '♝', '♞', '♜', '♟']
const Pieces =  {
    WHITE_PAWN : '♙',
    WHITE_ROOK : '♖',
    WHITE_KNIGHT : '♘',
    WHITE_BISHOP : '♗',
    WHITE_QUEEN : '♕',
    WHITE_KING: '♔',
    VID:'',
    BLACK_PAWN : '♟',
    BLACK_ROOK : '♜',
    BLACK_KNIGHT : '♞',
    BLACK_BISHOP : '♝',
    BLACK_QUEEN : '♛',
    BLACK_KING: '♚'
};
const P_White = ['♙','♖', '♘', '♗', '♕', '♔']
const P_Black = ['♟','♜', '♞', '♝', '♛', '♚']

let ok = true;//pentru mutarile din meci,asemanator cu semaforul


function swap(arr, index1, index2) {
    if (index1 < 0 || index1 >= arr.length || index2 < 0 || index2 >= arr.length) {console.error('Indexuri invalide');return;}
    [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
}

checkInputButton.addEventListener('change', () =>{
    if(checkInputButton.checked)
    {   
        buttonRotate.style.display = 'none';
        autoRotate = true;
    }
    else
    {
        buttonRotate.style.display = 'block';
        autoRotate = false;
    }
});

buttonRotate.addEventListener('click', ()=>{
    container_div.classList.toggle('rotation');
    squares.forEach(piece => {
            piece.classList.toggle('rotation'); 
        });
});

function DrawBoard()
{
    for(let i=0;i<64;i++){
        if((i/8)%2===0){
            for(let j=i;j<i+8;j++){
                if(j%2===1){
                    const square = board.children[j];
                    square.style.backgroundColor = 'chocolate';
                }
                else{
                    const square = board.children[j];
                    square.style.backgroundColor = 'burlywood';
                }
            }
        }
        else{
            for(let j=i;j<i+8;j++){
                if(j%2===1){
                    const square = board.children[j];
                    square.style.backgroundColor = 'burlywood';
                }
                else{
                    const square = board.children[j];
                    square.style.backgroundColor = 'chocolate';
                }
            }
        }
        i+=7;
    }
    
    
}

DrawBoard();

blackCaptureList.style.backgroundColor = 'saddlebrown';
whiteCaptureList.style.backgroundColor = 'saddlebrown';

//adaug piesele pe tabla
squares.forEach((square, index) => {
        const color = P_White.includes(startPieces[index])? "white":P_Black.includes(startPieces[index])?"black":"";
        if(color==="")
        {
            square.innerHTML = ``;
            const objEmpty = {
                piece:'',
                id:'empty',
                position:index,
            }
            boardObjects.push(objEmpty);
            return;
        }
        else{
            square.innerHTML = startPieces[index];
        }
        
        if(P_White.includes(startPieces[index])===true)
        {
            switch(startPieces[index])
            {
                case '♙':
                {   
                    pawn_w++;
                    const obj = {
                        piece:'♙',
                        id:`pawn${pawn_w}`,
                        position:index,
                        firstMove:false
                    }
                    PiecesWhite.push(obj.id);
                    boardObjects.push(obj);
                    break;
                }
                case '♖':
                {
                    rook_w++;
                    const obj={
                        piece:'♖',
                        id:`rook${rook_w}`,
                        position:index,
                        firstMove:false
                    }
                    PiecesWhite.push(obj.id);
                    boardObjects.push(obj);
                    break;
                }
                case '♘':
                {
                    knight_w++;
                    const obj={
                        piece:'♘',
                        id:`knight${knight_w}`,
                        position:index,
                    }
                    PiecesWhite.push(obj.id);
                    boardObjects.push(obj);
                    break;
                }
                case '♗':
                {
                    bishop_w++;
                    const obj={
                        piece:'♗',
                        id:`bishop${bishop_w}`,
                        position:index,
                    }
                    PiecesWhite.push(obj.id);
                    boardObjects.push(obj);
                    break;
                }
                case '♕':
                {
                    const obj={
                        piece:'♕',
                        id:"queen",
                        position:index
                    }
                    PiecesWhite.push(obj.id);
                    boardObjects.push(obj);
                    break;
                }
                case '♔':
                {
                    const obj={
                        piece:'♔',
                        id:"king",
                        position:index,
                        firstMove:false
                    }
                    PiecesWhite.push(obj.id);
                    boardObjects.push(obj);
                    break;
                }
                default:
                    break;//sau un throw
            }
        }

        if(P_Black.includes(startPieces[index])===true)
        {
            switch(startPieces[index])
            {
                case '♟':
                {   
                    const obj = {
                        piece:'♟',
                        id:`pawn${pawn_b}`,
                        position:index,
                        firstMove:false
                    }
                    pawn_b--;
                    PiecesBlack.push(obj.id);
                    boardObjects.push(obj);
                    break;
                }
                case '♜':
                {
                    
                    const obj={
                        piece:'♜',
                        id:`rook${rook_b}`,
                        position:index,
                        firstMove:false
                    }
                    rook_b--;
                    PiecesBlack.push(obj.id);
                    boardObjects.push(obj);
                    break;
                }
                case '♞':
                {
                    const obj={
                        piece:'♞',
                        id:`knight${knight_b}`,
                        position:index,
                    }
                    knight_b--;
                    PiecesBlack.push(obj.id);
                    boardObjects.push(obj);
                    break;
                }
                case '♝':
                {
                    const obj={
                        piece:'♝',
                        id:`bishop${bishop_b}`,
                        position:index,
                    }
                    bishop_b--;
                    PiecesBlack.push(obj.id);
                    boardObjects.push(obj);
                    break;
                }
                case '♛':
                {
                    const obj={
                        piece:'♛',
                        id:"queen",
                        position:index
                    }
                    PiecesBlack.push(obj.id);
                    boardObjects.push(obj);
                    break;
                }
                case '♚':
                {
                    const obj={
                        piece:'♚',
                        id:"king",
                        position:index,
                        firstMove:false
                    }
                    PiecesBlack.push(obj.id);
                    boardObjects.push(obj);
                    break;
                }
                default:
                    break;//sau un throw
            }
        }
});

function selectSquare(square) {
    
    if (selectedSquare) {
        selectedSquare.classList.remove("select");
    }
    selectedSquare = square;
    selectedSquare.classList.add("select");
}
let boardObjectsCopy;//pentru a simula mutarea

let selectedSquare = null;//selectare patrat de la promotion
let indexPromoted = -1;//index pozitia unde a facut pionul promovarea
let pressBtnPromotion = false;//verific daca s-a apasat butonul sau nu
let Promoted = {};
const btnPromotion = document.getElementById("confirm-promotion");


btnPromotion.addEventListener("click",()=>{
    //aici trebuie sa preiau ce tip de piesa e si sa inlocuiesc pt totdeauna pionul care a facut promovarea
    const piecePromotion = selectedSquare.textContent.trim();
    if(P_White.includes(piecePromotion)){
        Promoted = blackCaptureObjects.find(obj=>obj.piece.trim() === piecePromotion);
        Promoted = blackCaptureObjects.splice(blackCaptureObjects.indexOf(Promoted),1)[0];
        pressBtnPromotion = !pressBtnPromotion;
        boardObjects[indexPromoted] = Promoted;
        boardObjects[indexPromoted].position = indexPromoted;
        board.children[indexPromoted].textContent = boardObjects[indexPromoted].piece;
    }
    else{
        Promoted = whiteCaptureObjects.find(obj=>obj.piece.trim() === piecePromotion);
        Promoted = whiteCaptureObjects.splice(whiteCaptureObjects.indexOf(Promoted),1)[0];
        pressBtnPromotion = !pressBtnPromotion;
        boardObjects[indexPromoted] = Promoted;
        boardObjects[indexPromoted].position = indexPromoted;
        board.children[indexPromoted].textContent = boardObjects[indexPromoted].piece;
    }
    let whiteList = "",blackList = "";

        for(const piece of whiteCaptureObjects)
            {
                whiteList+=`${piece.piece}`;
            }
        whiteCaptureList.innerHTML =`
                <legend>White Capture List</legend>
                <p class="white-capture-pieces-p">${whiteList}</p>
            `
        
        for(const piece of blackCaptureObjects)
            {
                blackList+=`${piece.piece}`;
            }
        blackCaptureList.innerHTML =`
                <legend>Black Capture List</legend>
                <p class="black-capture-pieces-p">${blackList}</p>
            `
    Promoted = {};
    selectedSquare = null;
})

//verific daca am apasat o piesa
squares.forEach(square => {
    square.addEventListener('click', function() {
        
        const squareClickId = Number(square.id);
        if(ok===true)
        {   
            if(board.children[squareClickId].classList.contains("luminos")!==true && P_White.includes(square.textContent)===true && P_Black.includes(square.textContent)===false)
            {
                if(selectPieceId===-1)
                {
                    selectPieceId = squareClickId;
                }
                else if(squareClickId===selectPieceId)//daca am apasat pe aceeasi piesa,sa se elimine patratele luminoase
                {
                    for (let i = 0; i < board.children.length; i++){
                        board.children[i].classList.remove("luminos");
                        board.children[i].classList.remove("select");

                    }
                    selectPieceId = -1;
                    return;
                }
                else//daca selectez alta piesa,si inainte era selectata o piesa,piesa veche selectata va fi deselectata
                {
                    for (let i = 0; i < board.children.length; i++){
                        board.children[i].classList.remove("luminos");
                        board.children[i].classList.remove("select");
                    }
                    selectPieceId = squareClickId;
                }
                switch(square.textContent.trim())
                {
                    case '♙':
                    {
                        const nr = Number(square.id);
                        board.children[nr].classList.toggle("select");
                        
                        if( nr-8>=0&&P_White.includes(boardObjects[nr-8].piece)===false && P_Black.includes(boardObjects[nr-8].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-8;
                            boardObjectsCopy[nr-8].position = nr;
                            swap(boardObjectsCopy,nr-8,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr-8].classList.toggle("luminos");
                            }
                        }
                        if(nr-7>=0 &&nr%8<7 && P_Black.includes(boardObjects[nr-7].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-7;
                            boardObjectsCopy[nr-7] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,nr-7,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length) {
                                board.children[nr - 7].classList.toggle("luminos");
                            }
                        } 
                        if(nr-9>=0 &&nr%8>0 && P_Black.includes(boardObjects[nr-9].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-9;
                            boardObjectsCopy[nr-9] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,nr-9,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr-9].classList.toggle("luminos");
                            }
                        }

                        if(boardObjects[nr].firstMove===false && nr-16>=0)//inca n-am facut prima mutare
                        {
                            if(P_White.includes(boardObjects[nr-16].piece)===false && P_Black.includes(boardObjects[nr-16].piece)===false
                                && boardObjects[nr-8].id==='empty')
                            {
                                boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                                boardObjectsCopy[nr].position = nr-16;
                                boardObjectsCopy[nr-16].position = nr;
                                swap(boardObjectsCopy,nr-16,nr);
                                if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length) {
                                    board.children[nr - 16].classList.toggle("luminos");
                                }
                            }
                        }
                        break;
                    }
                    case '♖':
                    {
                        const nr = Number(square.id);
                        board.children[nr].classList.toggle("select");
                        let c = parseInt(nr/8)*8;
                        let goLeft = nr%8-1 ,goRight = nr%8+1;
                        let goTop = nr-8 , goBottom = nr+8;
                        
                        while(goLeft>=0 && P_Black.includes(boardObjects[c+goLeft].piece)===false && P_White.includes(boardObjects[c+goLeft].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft].position = nr;
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[c+goLeft].classList.toggle("luminos");
                            }
                            goLeft--;
                        }
                        if(goLeft>=0 && P_Black.includes(boardObjects[c+goLeft].piece)===true)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[c+goLeft].classList.toggle("luminos");
                            }
                        }

                        while(goRight<8 &&  P_Black.includes(boardObjects[c+goRight].piece)===false && P_White.includes(boardObjects[c+goRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight].position = nr;
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[c+goRight].classList.toggle("luminos");
                            }
                            goRight++;
                        }
                        if(goRight<8 &&  P_Black.includes(boardObjects[c+goRight].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[c+goRight].classList.toggle("luminos");
                            }
                        }

                        while(goTop>=0 && P_Black.includes(boardObjects[goTop].piece)===false && P_White.includes(boardObjects[goTop].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop].position = nr;
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goTop].classList.toggle("luminos");
                            }
                            goTop-=8;
                        }
                        if(goTop>=0 &&P_Black.includes(boardObjects[goTop].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goTop].classList.toggle("luminos");
                            }
                        }

                        while(goBottom<=63 && P_Black.includes(boardObjects[goBottom].piece)===false && P_White.includes(boardObjects[goBottom].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom].position = nr;
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goBottom].classList.toggle("luminos");
                            }
                            goBottom+=8;
                        }
                        if(goBottom<=63&&P_Black.includes(boardObjects[goBottom].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goBottom].classList.toggle("luminos");
                            }
                        }
                        break;
                    }
                    case '♘':
                    {    
                        const nr = Number(square.id);
                        board.children[nr].classList.toggle("select");
                        if(nr%8>=2 && nr-10>=0 &&  P_White.includes(boardObjects[nr-10].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-10;
                            if(P_Black.includes(boardObjects[nr-10].piece)===true)
                            {
                                boardObjectsCopy[nr-10] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-10].position = nr;
                            }
                            swap(boardObjectsCopy,nr-10,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr-10].classList.toggle("luminos");
                            }
                        }

                        if(nr%8>=1 && nr-17>=0 &&P_White.includes(boardObjects[nr-17].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-17;
                            if(P_Black.includes(boardObjects[nr-17].piece)===true)
                            {
                                boardObjectsCopy[nr-17] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-17].position = nr;
                            }
                            swap(boardObjectsCopy,nr-17,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr-17].classList.toggle("luminos");
                            }
                        }

                        if(nr%8<=6 && nr-15>=0 &&  P_White.includes(boardObjects[nr-15].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-15;
                            if(P_Black.includes(boardObjects[nr-15].piece)===true)
                            {
                                boardObjectsCopy[nr-15] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-15].position = nr;
                            }
                            swap(boardObjectsCopy,nr-15,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr-15].classList.toggle("luminos");
                            }
                        }

                        if(nr%8<=5 && nr-6>=0 && P_White.includes(boardObjects[nr-6].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-6;
                            if(P_Black.includes(boardObjects[nr-6].piece)===true)
                            {
                                boardObjectsCopy[nr-6] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-6].position = nr;
                            }
                            swap(boardObjectsCopy,nr-6,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr-6].classList.toggle("luminos");
                            }
                        }

                        if(nr%8<=6 && nr+17<=63 &&  P_White.includes(boardObjects[nr+17].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+17;
                            if(P_Black.includes(boardObjects[nr+17].piece)===true)
                            {
                                boardObjectsCopy[nr+17] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+17].position = nr;
                            }
                            swap(boardObjectsCopy,nr+17,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr+17].classList.toggle("luminos");
                            }
                        }

                        if(nr%8<=5 && nr+10<=63 && P_White.includes(boardObjects[nr+10].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+10;
                            if(P_Black.includes(boardObjects[nr+10].piece)===true)
                            {
                                boardObjectsCopy[nr+10] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+10].position = nr;
                            }
                            swap(boardObjectsCopy,nr+10,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr+10].classList.toggle("luminos");
                            }
                        }

                        if(nr%8>=1 && nr+15<=63 && P_White.includes(boardObjects[nr+15].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+15;
                            if(P_Black.includes(boardObjects[nr+15].piece)===true)
                            {
                                boardObjectsCopy[nr+15] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+15].position = nr;
                            }
                            swap(boardObjectsCopy,nr+15,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr+15].classList.toggle("luminos");
                            }
                        }

                        if(nr%8>=2 && nr+6<=63 && P_White.includes(boardObjects[nr+6].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+6;
                            if(P_Black.includes(boardObjects[nr+6].piece)===true)
                            {
                                boardObjectsCopy[nr+6] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+6].position = nr;
                            }
                            swap(boardObjectsCopy,nr+6,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr+6].classList.toggle("luminos");
                            }
                        }
                        break;
                    }
                    case '♗':
                    {
                        const nr = Number(square.id);
                        board.children[nr].classList.toggle("select");
                        let goTopLeft = nr-9 , goTopRight = nr-7;
                        
                        while(goTopLeft>=0&&goTopLeft%8<nr%8 && P_Black.includes(boardObjects[goTopLeft].piece)===false && P_White.includes(boardObjects[goTopLeft].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft].position = nr;
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goTopLeft].classList.toggle("luminos");
                            }
                            goTopLeft-=9;
                        }
                        if(goTopLeft>=0 &&((goTopLeft%8===0&&P_White.includes(boardObjects[goTopLeft].piece)===false) || (P_Black.includes(boardObjects[goTopLeft].piece)===true && goTopLeft%8<nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goTopLeft].classList.toggle("luminos");
                            }
                        }
                        
                        while(goTopRight>=0&&goTopRight%8>nr%8 && P_Black.includes(boardObjects[goTopRight].piece)===false && P_White.includes(boardObjects[goTopRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight].position = nr;
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goTopRight].classList.toggle("luminos");
                            }
                            goTopRight-=7;
                        }
                        if(goTopRight>=0 &&((goTopRight%8===7&& P_White.includes(boardObjects[goTopRight].piece)===false) || (P_Black.includes(boardObjects[goTopRight].piece)===true && goTopRight%8>nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goTopRight].classList.toggle("luminos");
                            }
                        }


                        let goBottomLeft = nr+7, goBottomRight = nr+9;
                        while(goBottomLeft<=63 && goBottomLeft%8<nr%8 && P_Black.includes(boardObjects[goBottomLeft].piece)===false && P_White.includes(boardObjects[goBottomLeft].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft].position = nr;
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomLeft].classList.toggle("luminos");
                            }
                            goBottomLeft+=7;
                        }
                        if((goBottomLeft<=63&&goBottomLeft%8<nr%8&&P_White.includes(boardObjects[goBottomLeft].piece)===false) || (goBottomLeft<=63 && goBottomLeft%8<nr%8 && P_Black.includes(boardObjects[goBottomLeft].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomLeft].classList.toggle("luminos");
                            }
                        }

                        while(goBottomRight<=63 && goBottomRight%8>nr%8 &&P_Black.includes(boardObjects[goBottomRight].piece)===false && P_White.includes(boardObjects[goBottomRight].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight].position = nr;
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomRight].classList.toggle("luminos");
                            }
                            goBottomRight+=9;
                        }
                        if((goBottomRight<=63&&goBottomRight%8>nr%8&&P_White.includes(boardObjects[goBottomRight].piece)===false) ||  (goBottomRight<=63 && goBottomRight%8>nr%8 && P_Black.includes(boardObjects[goBottomRight].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomRight].classList.toggle("luminos");
                            }
                        } 
                        break;
                    }
                    case '♕':
                    {
                        const nr = Number(square.id);
                        board.children[nr].classList.toggle("select");
                        let c = parseInt(nr/8)*8;
                        let goLeft = nr%8-1 ,goRight = nr%8+1;
                        let goTop = nr-8 , goBottom = nr+8;
                        
                        while(goLeft>=0 && P_Black.includes(boardObjects[c+goLeft].piece)===false && P_White.includes(boardObjects[c+goLeft].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft].position = nr;
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[c+goLeft].classList.toggle("luminos");
                            }
                            goLeft--;
                        }
                        if(goLeft>=0 && P_Black.includes(boardObjects[c+goLeft].piece)===true)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[c+goLeft].classList.toggle("luminos");
                            }
                        }

                        while(goRight<8 &&  P_Black.includes(boardObjects[c+goRight].piece)===false && P_White.includes(boardObjects[c+goRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight].position = nr;
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[c+goRight].classList.toggle("luminos");
                            }
                            goRight++;
                        }
                        if(goRight<8 &&  P_Black.includes(boardObjects[c+goRight].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[c+goRight].classList.toggle("luminos");
                            }
                        }

                        while(goTop>=0 && P_Black.includes(boardObjects[goTop].piece)===false && P_White.includes(boardObjects[goTop].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop].position = nr;
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goTop].classList.toggle("luminos");
                            }
                            goTop-=8;
                        }
                        if(goTop>=0 &&P_Black.includes(boardObjects[goTop].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goTop].classList.toggle("luminos");
                            }
                        }

                        while(goBottom<=63 && P_Black.includes(boardObjects[goBottom].piece)===false && P_White.includes(boardObjects[goBottom].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom].position = nr;
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goBottom].classList.toggle("luminos");
                            }
                            goBottom+=8;
                        }
                        if(goBottom<=63&&P_Black.includes(boardObjects[goBottom].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goBottom].classList.toggle("luminos");
                            }
                        }

                        let goTopLeft = nr-9 , goTopRight = nr-7;
                        
                        while(goTopLeft>=0&&goTopLeft%8<nr%8 && P_Black.includes(boardObjects[goTopLeft].piece)===false && P_White.includes(boardObjects[goTopLeft].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft].position = nr;
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length) {
                                board.children[goTopLeft].classList.toggle("luminos");
                            }
                            goTopLeft-=9;
                        }
                        if(goTopLeft>=0 &&((goTopLeft%8===0&&P_White.includes(boardObjects[goTopLeft].piece)===false) || (P_Black.includes(boardObjects[goTopLeft].piece)===true && goTopLeft%8<nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goTopLeft].classList.toggle("luminos");
                            }
                        }
                        
                        while(goTopRight>=0&&goTopRight%8>nr%8 && P_Black.includes(boardObjects[goTopRight].piece)===false && P_White.includes(boardObjects[goTopRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight].position = nr;
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goTopRight].classList.toggle("luminos");
                            }
                            goTopRight-=7;
                        }
                        if(goTopRight>=0 &&((goTopRight%8===7&& P_White.includes(boardObjects[goTopRight].piece)===false) || (P_Black.includes(boardObjects[goTopRight].piece)===true && goTopRight%8>nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goTopRight].classList.toggle("luminos");
                            }
                        }


                        let goBottomLeft = nr+7, goBottomRight = nr+9;
                        while(goBottomLeft<=63 && goBottomLeft%8<nr%8 && P_Black.includes(boardObjects[goBottomLeft].piece)===false && P_White.includes(boardObjects[goBottomLeft].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft].position = nr;
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomLeft].classList.toggle("luminos");
                            }
                            goBottomLeft+=7;
                        }
                        if((goBottomLeft<=63&&goBottomLeft%8<nr%8&&P_White.includes(boardObjects[goBottomLeft].piece)===false) || (goBottomLeft<=63 && goBottomLeft%8<nr%8 && P_Black.includes(boardObjects[goBottomLeft].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomLeft].classList.toggle("luminos");
                            }
                        }

                        while(goBottomRight<=63 && goBottomRight%8>nr%8 &&P_Black.includes(boardObjects[goBottomRight].piece)===false && P_White.includes(boardObjects[goBottomRight].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight].position = nr;
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomRight].classList.toggle("luminos");
                            }
                            goBottomRight+=9;
                        }
                        if((goBottomRight<=63&&goBottomRight%8>nr%8&&P_White.includes(boardObjects[goBottomRight].piece)===false) ||  (goBottomRight<=63 && goBottomRight%8>nr%8 && P_Black.includes(boardObjects[goBottomRight].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomRight].classList.toggle("luminos");
                            }
                        }         
                        break;
                    }
                    case '♔':
                    {
                        const nr = Number(square.id);
                        board.children[nr].classList.toggle("select");
                        if(nr-1>=0 && (nr-1)%8<nr%8 && P_White.includes(boardObjects[nr-1].piece)===false )
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-1;
                            if(P_Black.includes(boardObjects[nr-1].piece)===true)
                            {
                                boardObjectsCopy[nr-1] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-1].position = nr;
                            }
                            swap(boardObjectsCopy,nr-1,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr-1].classList.toggle("luminos");
                            }
                        }
                        if( nr+1<=63 && (nr+1)%8>nr%8 && P_White.includes(boardObjects[nr+1].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+1;
                            if(P_Black.includes(boardObjects[nr+1].piece)===true)
                            {
                                boardObjectsCopy[nr+1] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+1].position = nr;
                            }
                            swap(boardObjectsCopy,nr+1,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr+1].classList.toggle("luminos");
                            }
                        }
                        if(nr-8>=0 &&P_White.includes(boardObjects[nr-8].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-8;
                            if(P_Black.includes(boardObjects[nr-8].piece)===true)
                            {
                                boardObjectsCopy[nr-8] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-8].position = nr;
                            }
                            swap(boardObjectsCopy,nr-8,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr-8].classList.toggle("luminos");
                            }
                        }
                        if(nr+8<=63 && P_White.includes(boardObjects[nr+8].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+8;
                            if(P_Black.includes(boardObjects[nr+8].piece)===true)
                            {
                                boardObjectsCopy[nr+8] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+8].position = nr;
                            }
                            swap(boardObjectsCopy,nr+8,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr+8].classList.toggle("luminos");
                            }
                        }
                        if((nr-9)%8<nr%8 && nr-9>=0 && P_White.includes(boardObjects[nr-9].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-9;
                            if(P_Black.includes(boardObjects[nr-9].piece)===true)
                            {
                                boardObjectsCopy[nr-9] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-9].position = nr;
                            }
                            swap(boardObjectsCopy,nr-9,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr-9].classList.toggle("luminos");
                            }
                        }
                        if((nr-7)%8>nr%8 && nr-7>=0 && P_White.includes(boardObjects[nr-7].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-7;
                            if(P_Black.includes(boardObjects[nr-7].piece)===true)
                            {
                                boardObjectsCopy[nr-7] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-7].position = nr;
                            }
                            swap(boardObjectsCopy,nr-7,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr-7].classList.toggle("luminos");
                            }
                        }
                        if((nr+9)%8>nr%8 && nr+9<=63 &&P_White.includes(boardObjects[nr+9].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+9;
                            if(P_Black.includes(boardObjects[nr+9].piece)===true)
                            {
                                boardObjectsCopy[nr+9] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+9].position = nr;
                            }
                            swap(boardObjectsCopy,nr+9,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr+9].classList.toggle("luminos");
                            }
                        }
                        if((nr+7)%8<nr%8 && nr+7<=63 && P_White.includes(boardObjects[nr+7].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+7;
                            if(P_Black.includes(boardObjects[nr+7].piece)===true)
                            {
                                boardObjectsCopy[nr+7] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+7].position = nr;
                            }
                            swap(boardObjectsCopy,nr+7,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                board.children[nr+7].classList.toggle("luminos");
                            }
                        }

                        if(nr+3<=63 && positionWhiteIsCheck(nr).length===0 &&boardObjects[nr]?.firstMove===false && boardObjects[nr+3]?.piece ==='♖' && boardObjects[nr+3]?.firstMove===false &&
                            boardObjects[nr+1].id==='empty' && boardObjects[nr+2].id==='empty' && positionWhiteIsCheck(nr+1).length===0 && positionWhiteIsCheck(nr+2).length===0)
                        {
                            board.children[nr+3].classList.toggle("luminos");
                        }
                        if(nr-4>=0 && positionWhiteIsCheck(nr).length===0 &&boardObjects[nr]?.firstMove===false && boardObjects[nr-4].piece ==='♖' && boardObjects[nr-4]?.firstMove===false &&
                            boardObjects[nr-1].id==='empty' && boardObjects[nr-2].id==='empty'&& boardObjects[nr-3].id==='empty' && positionWhiteIsCheck(nr-1).length===0 && positionWhiteIsCheck(nr-2).length===0)
                        {
                            board.children[nr-4].classList.toggle("luminos");
                        }
                        break;
                    }
                    default:
                }
            
            }
            else if(board.children[squareClickId].classList.contains("luminos")===true && P_Black.includes(boardObjects[squareClickId].piece)===false)
            {
                const squareClickId = Number(square.id);
        
                const PieceSelected = board.children[selectPieceId];
                const SquareSelected = board.children[squareClickId];
                
                if(PieceSelected.textContent==='♔' && SquareSelected.textContent==='♖')
                {
                    if(squareClickId>selectPieceId)//rocada mica alb
                    {   
                        boardObjects[selectPieceId].firstMove = true;
                        boardObjects[squareClickId].firstMove = true;
                        
                        const squareEmpty1 = board.children[selectPieceId+2];
                        const temp = PieceSelected.innerHTML;

                        PieceSelected.innerHTML = squareEmpty1.innerHTML;
                        squareEmpty1.innerHTML = temp;
                        boardObjects[selectPieceId].position = selectPieceId+2;
                        boardObjects[selectPieceId+2].position = selectPieceId;
                        swap(boardObjects,selectPieceId+2,selectPieceId);


                        const squareEmpty2 = board.children[squareClickId-2];
                        const temp2 = SquareSelected.innerHTML;

                        SquareSelected.innerHTML = squareEmpty2.innerHTML;
                        squareEmpty2.innerHTML = temp2;

                        boardObjects[squareClickId].position = squareClickId-2;
                        boardObjects[squareClickId-2].position = squareClickId;
                        swap(boardObjects,squareClickId-2,squareClickId);
                    }
                    else{//rocada mare alb
                        boardObjects[selectPieceId].firstMove = true;
                        boardObjects[squareClickId].firstMove = true;
                        
                        const squareEmpty1 = board.children[selectPieceId-2];
                        const temp = PieceSelected.innerHTML;

                        PieceSelected.innerHTML = squareEmpty1.innerHTML;
                        squareEmpty1.innerHTML = temp;
                        boardObjects[selectPieceId].position = selectPieceId-2;
                        boardObjects[selectPieceId-2].position = selectPieceId;
                        swap(boardObjects,selectPieceId-2,selectPieceId);


                        const squareEmpty2 = board.children[squareClickId+3];
                        const temp2 = SquareSelected.innerHTML;

                        SquareSelected.innerHTML = squareEmpty2.innerHTML;
                        squareEmpty2.innerHTML = temp2;

                        boardObjects[squareClickId].position = squareClickId+3;
                        boardObjects[squareClickId+3].position = squareClickId;
                        swap(boardObjects,squareClickId+3,squareClickId);
                    }
                }
                else
                {
                    
                    if((boardObjects[selectPieceId].piece==='♙' || boardObjects[selectPieceId].piece==='♔' || boardObjects[selectPieceId].piece==='♖') && boardObjects[selectPieceId].firstMove===false)
                            {
                                boardObjects[selectPieceId].firstMove = true;
                            }
        
                    const temp = PieceSelected.innerHTML;

                    // Schimba continutul
                    PieceSelected.innerHTML = SquareSelected.innerHTML;
                    SquareSelected.innerHTML = temp;
                    
                    
                    boardObjects[selectPieceId].position = squareClickId;
                    boardObjects[squareClickId].position = selectPieceId;
                    swap(boardObjects,squareClickId,selectPieceId);

                    if(boardObjects[squareClickId].piece==='♙' && boardObjects[squareClickId].position<8 && blackCaptureObjects.length){
                        indexPromoted = squareClickId;
                        const list = document.createElement("div");
                        const ListView = [];
                        for(const obj of blackCaptureObjects){
                            if(obj.piece!='♙'){
                                ListView.push(obj);
                                const square = document.createElement("div");
                                square.setAttribute("class","square-promotion");
                                square.textContent = obj.piece;
                                square.onclick = function() {
                                    selectSquare(this);
                                };
                                list.appendChild(square);
                            }
                        }
                        if(list.children.length){
                            document.getElementById("myModal").style.display = "block";
                            list.setAttribute("id","board-promotion");
                            document.getElementById("modal-content").insertBefore(list,  document.getElementById("modal-content").firstChild);
                            let intervalId = setInterval(function() {
                                if (pressBtnPromotion) {
                                    pressBtnPromotion = !pressBtnPromotion;
                                    document.getElementById("modal-content").removeChild(document.getElementById("modal-content").firstChild);
                                    document.getElementById("myModal").style.display = "none";
                                    clearInterval(intervalId);  
                                }
                            }, 100);
                        }
                        
                    }
                    
                }
                    
                for (let i = 0; i < board.children.length; i++){
                        board.children[i].classList.remove("luminos");
                        board.children[i].classList.remove("select");
                    }
        
                    selectPieceId = -1;
                    ok = !ok;
                    if(positionBlackIsCheck(boardObjects.find( obj => obj.piece==='♚').position).length){//este sah la alb
                         if(checkmateBlack()===0)
                        {   
                            audioGameEnd.play();
                            setTimeout(()=>alert("ALB a castigat"),1000);
                            while (true) {}
                        }
                        else{//este sah dar nu este mat
                            audioCheck.play();
                        }
                    }
                    else{
                         if(checkmateBlack()===0)//aici testez daca este "PAT"
                        {   
                            audioGameEnd.play();
                            setTimeout(()=>alert("Egalitate"),1000);
                            while (true) {}
                        }
                        else{//este sah dar nu este mat
                            audioMove.play();
                        }
                    }
                    if(autoRotate)
                    {
                        setTimeout(function() {
                        
                            container_div.classList.toggle('rotation');
                            squares.forEach(piece => {
                                piece.classList.toggle('rotation'); 
                            });
                        }, 
                        1000);
                    }
                }
            else if(board.children[squareClickId].classList.contains("luminos")===true && P_Black.includes(boardObjects[squareClickId].piece)===true)
            {
                
                const squareClickId = Number(square.id);
        
                const PieceSelected = board.children[selectPieceId];
                const SquareSelected = board.children[squareClickId];

                const objEmpty = {
                    piece:'',
                    id:'empty',
                    position:selectPieceId,
                }
                boardObjects[selectPieceId].position = squareClickId;
                
                whiteCaptureObjects.push(boardObjects[squareClickId]);
                whiteCaptureObjects.sort((a, b) => orderBlack.indexOf(a.piece) - orderBlack.indexOf(b.piece));


                boardObjects[squareClickId] = objEmpty;


                const temp = PieceSelected.innerHTML;

                // Schimba continutul
                PieceSelected.innerHTML = '';
                SquareSelected.innerHTML = temp;
                
                swap(boardObjects,squareClickId,selectPieceId);

                for (let i = 0; i < board.children.length; i++){
                    board.children[i].classList.remove("luminos");
                    board.children[i].classList.remove("select");
                }

                if(boardObjects[squareClickId].piece==='♙' && boardObjects[squareClickId].position<8 && blackCaptureObjects.length){
                    indexPromoted = squareClickId;
                    const list = document.createElement("div");
                    const ListView = [];
                    for(const obj of blackCaptureObjects){
                        if(obj.piece!='♙'){
                            ListView.push(obj);
                            const square = document.createElement("div");
                            square.setAttribute("class","square-promotion");
                            square.textContent = obj.piece;
                            square.onclick = function() {
                                selectSquare(this);
                            };
                            list.appendChild(square);
                        }
                    }
                    if(list.children.length){
                        document.getElementById("myModal").style.display = "block";
                        list.setAttribute("id","board-promotion");
                        document.getElementById("modal-content").insertBefore(list,  document.getElementById("modal-content").firstChild);
                        let intervalId = setInterval(function() {
                            if (pressBtnPromotion) {
                                pressBtnPromotion = !pressBtnPromotion;
                                document.getElementById("modal-content").removeChild(document.getElementById("modal-content").firstChild);
                                document.getElementById("myModal").style.display = "none";
                                clearInterval(intervalId);  
                            }
                        }, 100);
                    }
                }

                let whiteList = "",blackList = "";

                for(const piece of whiteCaptureObjects)
                    {
                        whiteList+=`${piece.piece}`;
                    }
                whiteCaptureList.innerHTML =`
                        <legend>White Capture List</legend>
                        <p class="white-capture-pieces-p">${whiteList}</p>
                    `
                
                for(const piece of blackCaptureObjects)
                    {
                        blackList+=`${piece.piece}`;
                    }
                blackCaptureList.innerHTML =`
                        <legend>Black Capture List</legend>
                        <p class="black-capture-pieces-p">${blackList}</p>
                    `

                selectPieceId = -1;
                ok = !ok;
                if(positionBlackIsCheck(boardObjects.find( obj => obj.piece==='♚').position).length){//este sah la alb
                    if(checkmateBlack()===0)
                   {   
                       audioGameEnd.play();
                       setTimeout(()=>alert("ALB a castigat"),1000);
                       while (true) {}
                   }
                   else{//este sah dar nu este mat
                       audioCheck.play();
                   }
               }
               else{
                    if(checkmateBlack()===0)//aici testez daca este "PAT"
                   {   
                       audioGameEnd.play();
                       setTimeout(()=>alert("Egalitate"),1000);
                       while (true) {}
                   }
                   else{//este sah dar nu este mat
                       audioCapture.play();
                   }
               }
                if(autoRotate)
                {
                    setTimeout(function() {
                            
                        container_div.classList.toggle('rotation');
                        squares.forEach(piece => {
                            piece.classList.toggle('rotation'); 
                        });
                    }, 1000);
                }
            }  
                
        }
        else{
            if(board.children[squareClickId].classList.contains("luminos")!==true && P_Black.includes(square.textContent)===true && P_White.includes(boardObjects[squareClickId].piece)===false)
            {
                
                if(selectPieceId===-1)
                {
                    selectPieceId = squareClickId;
                }
                else if(squareClickId===selectPieceId)//daca am apasat pe aceeasi piesa,sa se elimine patratele luminoase
                {
                    for (let i = 0; i < board.children.length; i++){
                        board.children[i].classList.remove("luminos");
                        board.children[i].classList.remove("select");

                    }
                    selectPieceId = -1;
                    return;
                }
                else//daca selectez alta piesa,si inainte era selectata o piesa,piesa veche selectata va fi deselectata
                {
                    for (let i = 0; i < board.children.length; i++){
                        board.children[i].classList.remove("luminos");
                        board.children[i].classList.remove("select");
                    }
                    selectPieceId = squareClickId;
                }

                
                switch(square.textContent.trim())
                {
                    case '♟':
                    {
                        const nr = Number(square.id);
                        board.children[nr].classList.toggle("select");
                
                        if( P_White.includes(boardObjects[nr+8].piece)===false && P_Black.includes(boardObjects[nr+8].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+8;
                            boardObjectsCopy[nr+8].position = nr;
                            swap(boardObjectsCopy,nr+8,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr+8].classList.toggle("luminos");
                            } 
                        }
                        if(nr%8>0 && P_White.includes(boardObjects[nr+7].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+7;
                            boardObjectsCopy[nr+7] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,nr+7,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr+7].classList.toggle("luminos");
                            }
                        } 
                        if(nr%8<7 && P_White.includes(boardObjects[nr+9].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+9;
                            boardObjectsCopy[nr+9] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,nr+9,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr+9].classList.toggle("luminos");
                            }
                        }

                
                        if(boardObjects[nr].firstMove===false)
                        {
                            if(P_Black.includes(boardObjects[nr+16].piece)===false && P_White.includes(boardObjects[nr+16].piece)===false
                            && boardObjects[nr+8].id==='empty')
                            {
                                boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                                boardObjectsCopy[nr].position = nr+16;
                                boardObjectsCopy[nr+16].position = nr;
                                swap(boardObjectsCopy,nr+16,nr);
                                if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                                {
                                    board.children[nr+16].classList.toggle("luminos");
                                }
                            }
                        }
                        break;
                    }
                    case '♜':
                    {
                        const nr = Number(square.id);
                        board.children[nr].classList.toggle("select");
                        let c = parseInt(nr/8)*8;
                        let goLeft = nr%8-1 ,goRight = nr%8+1;
                        let goTop = nr-8 , goBottom = nr+8;
                        
                        while(goLeft>=0 && P_Black.includes(boardObjects[c+goLeft].piece)===false && P_White.includes(boardObjects[c+goLeft].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft].position = nr;
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[c+goLeft].classList.toggle("luminos");
                            }
                            goLeft--;
                        }
                        if(goLeft>=0 && P_White.includes(boardObjects[c+goLeft].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[c+goLeft].classList.toggle("luminos");
                            }
                        }

                        while(goRight<8 &&  P_Black.includes(boardObjects[c+goRight].piece)===false && P_White.includes(boardObjects[c+goRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight].position = nr;
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[c+goRight].classList.toggle("luminos");
                            }
                            goRight++;
                        }
                        if(goRight<8 &&  P_White.includes(boardObjects[c+goRight].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[c+goRight].classList.toggle("luminos");
                            }
                        }

                        while(goTop>=0 && P_Black.includes(boardObjects[goTop].piece)===false && P_White.includes(boardObjects[goTop].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop].position = nr;
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goTop].classList.toggle("luminos");
                            }
                            goTop-=8;
                        }
                        if(goTop>=0 &&P_White.includes(boardObjects[goTop].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goTop].classList.toggle("luminos");
                            }
                        }

                        while(goBottom<=63 && P_Black.includes(boardObjects[goBottom].piece)===false && P_White.includes(boardObjects[goBottom].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom].position = nr;
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goBottom].classList.toggle("luminos");
                            }
                            goBottom+=8;
                        }
                        if(goBottom<=63&&P_White.includes(boardObjects[goBottom].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goBottom].classList.toggle("luminos");
                            }
                        }
                        break;
                    }
                    case '♞':
                    {    
                        const nr = Number(square.id);
                        board.children[nr].classList.toggle("select");
                        if(nr%8>=2 && nr-10>=0 && P_Black.includes(boardObjects[nr-10].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-10;
                            if(P_White.includes(boardObjects[nr-10].piece)===true)
                            {
                                boardObjectsCopy[nr-10] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-10].position = nr;
                            }
                            swap(boardObjectsCopy,nr-10,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr-10].classList.toggle("luminos");
                            }
                        }

                        if(nr%8>=1 && nr-17>=0 && P_Black.includes(boardObjects[nr-17].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-17;
                            if(P_White.includes(boardObjects[nr-17].piece)===true)
                            {
                                boardObjectsCopy[nr-17] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-17].position = nr;
                            }
                            swap(boardObjectsCopy,nr-17,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr-17].classList.toggle("luminos");
                            }
                        }

                        if(nr%8<=6 && nr-15>=0 && P_Black.includes(boardObjects[nr-15].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-15;
                            if(P_White.includes(boardObjects[nr-15].piece)===true)
                            {
                                boardObjectsCopy[nr-15] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-15].position = nr;
                            }
                            swap(boardObjectsCopy,nr-15,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr-15].classList.toggle("luminos");
                            }
                        }

                        if(nr%8<=5 && nr-6>=0 &&P_Black.includes(boardObjects[nr-6].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-6;
                            if(P_White.includes(boardObjects[nr-6].piece)===true)
                            {
                                boardObjectsCopy[nr-6] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-6].position = nr;
                            }
                            swap(boardObjectsCopy,nr-6,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr-6].classList.toggle("luminos");
                            }
                        }

                        if(nr%8<=6 && nr+17<=63 &&  P_Black.includes(boardObjects[nr+17].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+17;
                            if(P_White.includes(boardObjects[nr+17].piece)===true)
                            {
                                boardObjectsCopy[nr+17] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+17].position = nr;
                            }
                            swap(boardObjectsCopy,nr+17,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr+17].classList.toggle("luminos");
                            }
                        }

                        if(nr%8<=5 && nr+10<=63 &&  P_Black.includes(boardObjects[nr+10].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+10;
                            if(P_White.includes(boardObjects[nr+10].piece)===true)
                            {
                                boardObjectsCopy[nr+10] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+10].position = nr;
                            }
                            swap(boardObjectsCopy,nr+10,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr+10].classList.toggle("luminos");
                            }
                        }

                        if(nr%8>=1 && nr+15<=63 &&  P_Black.includes(boardObjects[nr+15].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+15;
                            if(P_White.includes(boardObjects[nr+15].piece)===true)
                            {
                                boardObjectsCopy[nr+15] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+15].position = nr;
                            }
                            swap(boardObjectsCopy,nr+15,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr+15].classList.toggle("luminos");
                            }
                        }

                        if(nr%8>=2 && nr+6<=63 &&  P_Black.includes(boardObjects[nr+6].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+6;
                            if(P_White.includes(boardObjects[nr+6].piece)===true)
                            {
                                boardObjectsCopy[nr+6] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+6].position = nr;
                            }
                            swap(boardObjectsCopy,nr+6,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr+6].classList.toggle("luminos");
                            }
                        }
                        break;
                    }
                    case '♝':
                    {
                        const nr = Number(square.id);
                        board.children[nr].classList.toggle("select");
                        let goTopLeft = nr-9 , goTopRight = nr-7;
                        
                        while(goTopLeft>=0&&goTopLeft%8<nr%8 && P_Black.includes(boardObjects[goTopLeft].piece)===false && P_White.includes(boardObjects[goTopLeft].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft].position = nr;
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goTopLeft].classList.toggle("luminos");
                            }
                            goTopLeft-=9;
                        }
                        if(goTopLeft>=0 &&((goTopLeft%8===0&&P_Black.includes(boardObjects[goTopLeft].piece)===false) || (P_White.includes(boardObjects[goTopLeft].piece)===true && goTopLeft%8<nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goTopLeft].classList.toggle("luminos");
                            }
                        }
                        
                        while(goTopRight>=0&&goTopRight%8>nr%8 && P_Black.includes(boardObjects[goTopRight].piece)===false && P_White.includes(boardObjects[goTopRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight].position = nr;
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goTopRight].classList.toggle("luminos");
                            }
                            goTopRight-=7;
                        }
                        if(goTopRight>=0 &&((goTopRight%8===7&& P_Black.includes(boardObjects[goTopRight].piece)===false) || (P_White.includes(boardObjects[goTopRight].piece)===true && goTopRight%8>nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goTopRight].classList.toggle("luminos");
                            }
                        }


                        let goBottomLeft = nr+7, goBottomRight = nr+9;
                        while(goBottomLeft<=63 && goBottomLeft%8<nr%8 && P_Black.includes(boardObjects[goBottomLeft].piece)===false && P_White.includes(boardObjects[goBottomLeft].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft].position = nr;
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomLeft].classList.toggle("luminos");
                            }
                            goBottomLeft+=7;
                        }
                        if((goBottomLeft<=63&&goBottomLeft%8<nr%8&&P_Black.includes(boardObjects[goBottomLeft].piece)===false) || (goBottomLeft%8<nr%8 && P_White.includes(boardObjects[goBottomLeft].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomLeft].classList.toggle("luminos");
                            }
                        }

                        while(goBottomRight<=63 && goBottomRight%8>nr%8 &&P_Black.includes(boardObjects[goBottomRight].piece)===false && P_White.includes(boardObjects[goBottomRight].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight].position = nr;
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomRight].classList.toggle("luminos");
                            }
                            goBottomRight+=9;
                        }
                        if((goBottomRight<=63&&goBottomRight%8>nr%8&&P_Black.includes(boardObjects[goBottomRight].piece)===false) ||  (goBottomRight%8>nr%8 && P_White.includes(boardObjects[goBottomRight].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomRight].classList.toggle("luminos");
                            }
                        } 
                        break;
                    }
                    case '♛':
                    {
                        const nr = Number(square.id);
                        board.children[nr].classList.toggle("select");
                        let c = parseInt(nr/8)*8;
                        let goLeft = nr%8-1 ,goRight = nr%8+1;
                        let goTop = nr-8 , goBottom = nr+8;
                        
                        while(goLeft>=0 && P_Black.includes(boardObjects[c+goLeft].piece)===false && P_White.includes(boardObjects[c+goLeft].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft].position = nr;
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[c+goLeft].classList.toggle("luminos");
                            }
                            goLeft--;
                        }
                        if(goLeft>=0 && P_White.includes(boardObjects[c+goLeft].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[c+goLeft].classList.toggle("luminos");
                            }
                        }

                        while(goRight<8 &&  P_Black.includes(boardObjects[c+goRight].piece)===false && P_White.includes(boardObjects[c+goRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight].position = nr;
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[c+goRight].classList.toggle("luminos");
                            }
                            goRight++;
                        }
                        if(goRight<8 &&  P_White.includes(boardObjects[c+goRight].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[c+goRight].classList.toggle("luminos");
                            }
                        }

                        while(goTop>=0 && P_Black.includes(boardObjects[goTop].piece)===false && P_White.includes(boardObjects[goTop].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop].position = nr;
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goTop].classList.toggle("luminos");
                            }
                            goTop-=8;
                        }
                        if(goTop>=0 &&P_White.includes(boardObjects[goTop].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goTop].classList.toggle("luminos");
                            }
                        }

                        while(goBottom<=63 && P_Black.includes(boardObjects[goBottom].piece)===false && P_White.includes(boardObjects[goBottom].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom].position = nr;
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goBottom].classList.toggle("luminos");
                            }
                            goBottom+=8;
                        }
                        if(goBottom<=63&&P_White.includes(boardObjects[goBottom].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goBottom].classList.toggle("luminos");
                            }
                        }

                        let goTopLeft = nr-9 , goTopRight = nr-7;
                        
                        while(goTopLeft>=0&&goTopLeft%8<nr%8 && P_Black.includes(boardObjects[goTopLeft].piece)===false && P_White.includes(boardObjects[goTopLeft].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft].position = nr;
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goTopLeft].classList.toggle("luminos");
                            }
                            goTopLeft-=9;
                        }
                        if(goTopLeft>=0 &&((goTopLeft%8===0&&P_Black.includes(boardObjects[goTopLeft].piece)===false) || (P_White.includes(boardObjects[goTopLeft].piece)===true && goTopLeft%8<nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goTopLeft].classList.toggle("luminos");
                            }
                        }
                        
                        while(goTopRight>=0&&goTopRight%8>nr%8 && P_Black.includes(boardObjects[goTopRight].piece)===false && P_White.includes(boardObjects[goTopRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight].position = nr;
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goTopRight].classList.toggle("luminos");
                            }
                            goTopRight-=7;
                        }
                        if(goTopRight>=0 &&((goTopRight%8===7&& P_Black.includes(boardObjects[goTopRight].piece)===false) || (P_White.includes(boardObjects[goTopRight].piece)===true && goTopRight%8>nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goTopRight].classList.toggle("luminos");
                            }
                        }


                        let goBottomLeft = nr+7, goBottomRight = nr+9;
                        while(goBottomLeft<=63 && goBottomLeft%8<nr%8 && P_Black.includes(boardObjects[goBottomLeft].piece)===false && P_White.includes(boardObjects[goBottomLeft].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft].position = nr;
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomLeft].classList.toggle("luminos");
                            }
                            goBottomLeft+=7;
                        }
                        if((goBottomLeft<=63&&goBottomLeft%8<nr%8&&P_Black.includes(boardObjects[goBottomLeft].piece)===false) || (goBottomLeft<=63 && goBottomLeft%8<nr%8 && P_White.includes(boardObjects[goBottomLeft].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomLeft].classList.toggle("luminos");
                            }
                        }

                        while(goBottomRight<=63 && goBottomRight%8>nr%8 &&P_Black.includes(boardObjects[goBottomRight].piece)===false && P_White.includes(boardObjects[goBottomRight].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight].position = nr;
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomRight].classList.toggle("luminos");
                            }
                            goBottomRight+=9;
                        }
                        if((goBottomRight<=63&&goBottomRight%8>nr%8&&P_Black.includes(boardObjects[goBottomRight].piece)===false) ||  (goBottomRight<=63 && goBottomRight%8>nr%8 && P_White.includes(boardObjects[goBottomRight].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[goBottomRight].classList.toggle("luminos");
                            }
                        }
                        break;
                    }
                    case '♚':
                    {
                        const nr = Number(square.id);
                        board.children[nr].classList.toggle("select");
                        if(nr-1>=0 && (nr-1)%8<nr%8 && P_Black.includes(boardObjects[nr-1].piece)===false )
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-1;
                            if(P_White.includes(boardObjects[nr-1].piece)===true)
                            {
                                boardObjectsCopy[nr-1] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-1].position = nr;
                            }
                            swap(boardObjectsCopy,nr-1,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr-1].classList.toggle("luminos");
                            }
                        }
                        if( nr+1<=63 && (nr+1)%8>nr%8 && P_Black.includes(boardObjects[nr+1].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+1;
                            if(P_White.includes(boardObjects[nr+1].piece)===true)
                            {
                                boardObjectsCopy[nr+1] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+1].position = nr;
                            }
                            swap(boardObjectsCopy,nr+1,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr+1].classList.toggle("luminos");
                            }
                        }
                        if(nr-8>=0 &&P_Black.includes(boardObjects[nr-8].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-8;
                            if(P_White.includes(boardObjects[nr-8].piece)===true)
                            {
                                boardObjectsCopy[nr-8] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-8].position = nr;
                            }
                            swap(boardObjectsCopy,nr-8,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr-8].classList.toggle("luminos");
                            }
                        }
                        if(nr+8<=63 && P_Black.includes(boardObjects[nr+8].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+8;
                            if(P_White.includes(boardObjects[nr+8].piece)===true)
                            {
                                boardObjectsCopy[nr+8] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+8].position = nr;
                            }
                            swap(boardObjectsCopy,nr+8,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr+8].classList.toggle("luminos");
                            }
                        }
                        if((nr-9)%8<nr%8 && nr-9>=0 && P_Black.includes(boardObjects[nr-9].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-9;
                            if(P_White.includes(boardObjects[nr-9].piece)===true)
                            {
                                boardObjectsCopy[nr-9] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-9].position = nr;
                            }
                            swap(boardObjectsCopy,nr-9,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr-9].classList.toggle("luminos");
                            }
                        }
                        if((nr-7)%8>nr%8 && nr-7>=0 && P_Black.includes(boardObjects[nr-7].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-7;
                            if(P_White.includes(boardObjects[nr-7].piece)===true)
                            {
                                boardObjectsCopy[nr-7] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-7].position = nr;
                            }
                            swap(boardObjectsCopy,nr-7,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr-7].classList.toggle("luminos");
                            }
                        }
                        if((nr+9)%8>nr%8 && nr+9<=63 &&P_Black.includes(boardObjects[nr+9].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+9;
                            if(P_White.includes(boardObjects[nr+9].piece)===true)
                            {
                                boardObjectsCopy[nr+9] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+9].position = nr;
                            }
                            swap(boardObjectsCopy,nr+9,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr+9].classList.toggle("luminos");
                            }
                        }
                        if((nr+7)%8<nr%8 && nr+7<=63 && P_Black.includes(boardObjects[nr+7].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+7;
                            if(P_White.includes(boardObjects[nr+7].piece)===true)
                            {
                                boardObjectsCopy[nr+7] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+7].position = nr;
                            }
                            swap(boardObjectsCopy,nr+7,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                board.children[nr+7].classList.toggle("luminos");
                            }
                        }
                        
                    
                        if(positionBlackIsCheck(nr).length===0 &&boardObjects[nr].firstMove===false && boardObjects[nr+3].piece ==='♜' && boardObjects[nr+3].firstMove===false &&
                                boardObjects[nr+1].id==='empty' && boardObjects[nr+2].id==='empty' && positionBlackIsCheck(nr+1).length===0 && positionBlackIsCheck(nr+2).length===0)
                            {   
                                board.children[nr+3].classList.toggle("luminos");
                            }
                        if(positionBlackIsCheck(nr).length===0 &&boardObjects[nr].firstMove===false && boardObjects[nr-4].piece ==='♜' && boardObjects[nr-4].firstMove===false &&
                                boardObjects[nr-1].id==='empty' && boardObjects[nr-2].id==='empty'&& boardObjects[nr-3].id==='empty' && positionBlackIsCheck(nr-1).length===0 && positionBlackIsCheck(nr-2).length===0)
                            {
                                board.children[nr-4].classList.toggle("luminos");
                            }

                        break;
                    }
                    default:
                }
            }
            else if(board.children[squareClickId].classList.contains("luminos")===true && P_White.includes(boardObjects[squareClickId].piece)===false)
            {
                const squareClickId = Number(square.id);
                const PieceSelected = board.children[selectPieceId];
                const SquareSelected = board.children[squareClickId];
                if(PieceSelected.textContent==='♚' && SquareSelected.textContent==='♜')
                {
                    if(squareClickId>selectPieceId)//rocada mica negru
                        {   
                            boardObjects[selectPieceId].firstMove = true;
                            boardObjects[squareClickId].firstMove = true;
                            
                            const squareEmpty1 = board.children[selectPieceId+2];
                            const temp = PieceSelected.innerHTML;

                            PieceSelected.innerHTML = squareEmpty1.innerHTML;
                            squareEmpty1.innerHTML = temp;
                            boardObjects[selectPieceId].position = selectPieceId+2;
                            boardObjects[selectPieceId+2].position = selectPieceId;
                            swap(boardObjects,selectPieceId+2,selectPieceId);


                            const squareEmpty2 = board.children[squareClickId-2];
                            const temp2 = SquareSelected.innerHTML;

                            SquareSelected.innerHTML = squareEmpty2.innerHTML;
                            squareEmpty2.innerHTML = temp2;

                            boardObjects[squareClickId].position = squareClickId-2;
                            boardObjects[squareClickId-2].position = squareClickId;
                            swap(boardObjects,squareClickId-2,squareClickId);
                        }
                        else{//rocada mare negru
                            boardObjects[selectPieceId].firstMove = true;
                            boardObjects[squareClickId].firstMove = true;
                            
                            const squareEmpty1 = board.children[selectPieceId-2];
                            const temp = PieceSelected.innerHTML;

                            PieceSelected.innerHTML = squareEmpty1.innerHTML;
                            squareEmpty1.innerHTML = temp;
                            boardObjects[selectPieceId].position = selectPieceId-2;
                            boardObjects[selectPieceId-2].position = selectPieceId;
                            swap(boardObjects,selectPieceId-2,selectPieceId);


                            const squareEmpty2 = board.children[squareClickId+3];
                            const temp2 = SquareSelected.innerHTML;

                            SquareSelected.innerHTML = squareEmpty2.innerHTML;
                            squareEmpty2.innerHTML = temp2;

                            boardObjects[squareClickId].position = squareClickId+3;
                            boardObjects[squareClickId+3].position = squareClickId;
                            swap(boardObjects,squareClickId+3,squareClickId);
                        }
                }
                else{
                let index = boardObjects.findIndex(obj => obj.position === selectPieceId);
                if(index!==-1)
                    {
                        if((boardObjects[index].piece==='♟'|| boardObjects[selectPieceId].piece==='♚' || boardObjects[selectPieceId].piece==='♜') && boardObjects[index].firstMove===false)
                        {
                            boardObjects[index].firstMove = true;
                        }
                    }
                const temp = PieceSelected.innerHTML;

                PieceSelected.innerHTML = SquareSelected.innerHTML;
                SquareSelected.innerHTML = temp;
                
                
                boardObjects[selectPieceId].position = squareClickId;
                boardObjects[squareClickId].position = selectPieceId;
                swap(boardObjects,squareClickId,selectPieceId);
                }
        
                    
                for (let i = 0; i < board.children.length; i++){
                        board.children[i].classList.remove("luminos");
                        board.children[i].classList.remove("select");
                    }
        

                if(boardObjects[squareClickId].piece==='♟' && boardObjects[squareClickId].position>55 && whiteCaptureObjects.length){
                        indexPromoted = squareClickId;
                        const list = document.createElement("div");
                        const ListView = [];
                        for(const obj of whiteCaptureObjects){
                            if(obj.piece!='♟'){
                                ListView.push(obj);
                                const square = document.createElement("div");
                                square.setAttribute("class","square-promotion");
                                square.textContent = obj.piece;
                                square.onclick = function() {
                                    selectSquare(this);
                                };
                                list.appendChild(square);
                            }
                        }
                        if(list.children.length){
                            document.getElementById("myModal").style.display = "block";
                            list.setAttribute("id","board-promotion");
                            document.getElementById("modal-content").insertBefore(list,  document.getElementById("modal-content").firstChild);
                            let intervalId = setInterval(function() {
                                if (pressBtnPromotion) {
                                    pressBtnPromotion = !pressBtnPromotion;
                                    document.getElementById("modal-content").removeChild(document.getElementById("modal-content").firstChild);
                                    document.getElementById("myModal").style.display = "none";
                                    clearInterval(intervalId);  
                                }
                            }, 100);
                        }
                    }

                    selectPieceId = -1;
                    ok = !ok;
                     if(positionWhiteIsCheck(boardObjects.find( obj => obj.piece==='♔').position).length){//este sah la alb
                        if(checkmateWhite()===0)
                        {   
                            audioGameEnd.play();
                            alert("Negru a castigat");
                            while (true) {}
                        }
                        else{//este sah dar nu este mat
                            audioCheck.play();
                        }
                    }
                    else{
                        if(checkmateWhite()===0)
                        {   
                            audioGameEnd.play();
                            alert("Egalitate");
                            while (true) {}
                        }
                        else{//este sah dar nu este mat
                            audioMove.play();
                        }
                    } 
                    
                    if(autoRotate)
                    {
                        setTimeout(function() {
                                
                            container_div.classList.toggle('rotation');
                            squares.forEach(piece => {
                                piece.classList.toggle('rotation'); 
                            });
                        }, 1000);
                    }
                }
            else if(board.children[squareClickId].classList.contains("luminos")===true && P_White.includes(boardObjects[squareClickId].piece)===true)
            {
                const squareClickId = Number(square.id);
        
                const PieceSelected = board.children[selectPieceId];//patratul care contine si piese in sine in interiorul lui
                const SquareSelected = board.children[squareClickId];

                const objEmpty = {
                    piece:'',
                    id:'empty',
                    position:selectPieceId,
                }
                boardObjects[selectPieceId].position = squareClickId;
                
                blackCaptureObjects.push(boardObjects[squareClickId]);
                blackCaptureObjects.sort((a, b) => orderWhite.indexOf(a.piece) - orderWhite.indexOf(b.piece));
                
                boardObjects[squareClickId] = objEmpty;


                const temp = PieceSelected.innerHTML;

                PieceSelected.innerHTML = '';
                SquareSelected.innerHTML = temp;
                
                swap(boardObjects,squareClickId,selectPieceId);

                for (let i = 0; i < board.children.length; i++){
                    board.children[i].classList.remove("luminos");
                    board.children[i].classList.remove("select");
                }

                if(boardObjects[squareClickId].piece==='♟' && boardObjects[squareClickId].position>55 && whiteCaptureObjects.length){
                    indexPromoted = squareClickId;
                    const list = document.createElement("div");
                    const ListView = [];
                    for(const obj of whiteCaptureObjects){
                        if(obj.piece!='♟'){
                            ListView.push(obj);
                            const square = document.createElement("div");
                            square.setAttribute("class","square-promotion");
                            square.textContent = obj.piece;
                            square.onclick = function() {
                                selectSquare(this);
                            };
                            list.appendChild(square);
                        }
                    }
                    if(list.children.length){
                        document.getElementById("myModal").style.display = "block";
                        list.setAttribute("id","board-promotion");
                        document.getElementById("modal-content").insertBefore(list,  document.getElementById("modal-content").firstChild);
                        let intervalId = setInterval(function() {
                            if (pressBtnPromotion) {
                                pressBtnPromotion = !pressBtnPromotion;
                                document.getElementById("modal-content").removeChild(document.getElementById("modal-content").firstChild);
                                document.getElementById("myModal").style.display = "none";
                                clearInterval(intervalId);  
                            }
                        }, 100);
                    }
                }
                let whiteList = "",blackList = "";

                for(const piece of whiteCaptureObjects)
                    {
                        whiteList+=`${piece.piece}`;
                    }
                whiteCaptureList.innerHTML =`
                        <legend>White Capture List</legend>
                        <p class="white-capture-pieces-p">${whiteList}</p>
                    `
                
                for(const piece of blackCaptureObjects)
                    {
                        blackList+=`${piece.piece}`;
                    }
                blackCaptureList.innerHTML =`
                        <legend>Black Capture List</legend>
                        <p class="black-capture-pieces-p">${blackList}</p>
                        `

                
                selectPieceId = -1;
                ok = !ok;
                 if(positionWhiteIsCheck(boardObjects.find( obj => obj.piece==='♔').position).length){//este sah la alb
                    if(checkmateBlack()===0)
                    {   
                        audioGameEnd.play();
                        alert("Negru a castigat");
                        while (true) {}
                    }
                    else{//este sah dar nu este mat
                        audioCheck.play();
                    }
                }
                else{
                    if(checkmateWhite()===0)
                    {   
                        audioGameEnd.play();
                        alert("Egalitate");
                        while (true) {};
                    }
                    else{//este sah dar nu este mat
                        audioCapture.play();
                    }
                } 
                if(autoRotate)
                {
                    setTimeout(function() {
                                
                        container_div.classList.toggle('rotation');
                        squares.forEach(piece => {
                            piece.classList.toggle('rotation'); 
                        });
                    }, 1000);
                }
            }
        }
})
});

function positionWhiteIsCheck(position,board = boardObjects)//returneaza un array cu pozitiile care pun square[position] in sah
{
    const id = position;
    let left = id-1;
    const piecesCheck = [];
    while(left>=0 && left%8<id%8 && P_White.includes(board[left].piece)===false && P_Black.includes(board[left].piece)===false )
    {
        left--;
    }
    if(left>=0 && left%8>=0 && P_Black.includes(board[left].piece)===true)
    {
        const p = board[left].piece.trim();
        if(p==='♜' || p==='♛')
        {
            piecesCheck.push(left);
        }
    }

    let right = id+1;
    while(right<=63 &&right%8>id%8 && P_White.includes(board[right].piece)===false && P_Black.includes(board[right].piece)===false )
    {
        right++;
    }
    if(right<=63 &&right%8>id%8 && P_Black.includes(board[right].piece)===true)
    {
        const p = board[right].piece.trim();
        if(p==='♜' || p==='♛')
        {
            piecesCheck.push(right);
        }
    }

    let top = id-8;
    while(top>=0 && P_White.includes(board[top].piece)===false && P_Black.includes(board[top].piece)===false)
    {
        top-=8;
    }
    if(top>=0 && P_Black.includes(board[top].piece)===true)
    {
        const p = board[top].piece.trim();
        if(p==='♜' || p==='♛')
        {
            piecesCheck.push(top);
        }
    }

    let bottom = id+8;
    while(bottom<=63 && P_White.includes(board[bottom].piece)===false && P_Black.includes(board[bottom].piece)===false)
    {
        bottom+=8;
    }
    if(bottom<=63 && P_Black.includes(board[bottom].piece)===true)
    {
        const p = board[bottom].piece.trim();
        if(p==='♜' || p==='♛')
        {
            piecesCheck.push(bottom);
        }
    }

    let topLeft = id-9;
    while(topLeft%8<id%8 && topLeft>=0 && P_White.includes(board[topLeft].piece)===false && P_Black.includes(board[topLeft].piece)===false)
    {
        topLeft-=9;
    }
    if(topLeft%8<id%8 && topLeft>=0 &&  P_Black.includes(board[topLeft].piece)===true)
    {
        const p = board[topLeft].piece.trim();
        if(p==='♝' || p==='♛')
        {
            piecesCheck.push(topLeft);
        }
        if(topLeft === id-9 && p==='♟')
        {
            piecesCheck.push(topLeft);
        }
    }

    let topRight = id-7;
    while(topRight%8>id%8 && topRight>=0 && P_White.includes(board[topRight].piece)===false && P_Black.includes(board[topRight].piece)===false)
    {
        topRight-=7;
    }
    if(topRight%8>id%8 && topRight>=0 &&  P_Black.includes(board[topRight].piece)===true)
    {
        const p = board[topRight].piece.trim();
        if(p==='♝' || p==='♛')
        {
            piecesCheck.push(topRight);
        }
        if(topRight === id-7 && p==='♟')
        {
            piecesCheck.push(topRight);
        }
    }

    let bottomLeft = id+7;
    while(bottomLeft%8<id%8 && bottomLeft<=63 && P_White.includes(board[bottomLeft].piece)===false && P_Black.includes(board[bottomLeft].piece)===false)
    {
        bottomLeft+=7;
    }
    if(bottomLeft%8<id%8 && bottomLeft<=63 &&  P_Black.includes(board[bottomLeft].piece)===true)
    {
        const p = board[bottomLeft].piece.trim();
        if(p==='♝' || p==='♛')
        {
            piecesCheck.push(bottomLeft);
        }
    }

    let bottomRight = id+9;
    while(bottomRight%8>id%8 && bottomRight<=63 && P_White.includes(board[bottomRight].piece)===false && P_Black.includes(board[bottomRight].piece)===false)
    {
        bottomRight+=9;
    }
    if(bottomRight%8>id%8 && bottomRight<=63 &&  P_Black.includes(board[bottomRight].piece)===true)
    {
        const p = board[bottomRight].piece.trim();
        if(p==='♝' || p==='♛')
        {
            piecesCheck.push(bottomRight);
        }
    }

    if(id-10>=0 && id%8>=2 && board[id-10].piece==='♞'){
        piecesCheck.push(id-10);
    }
    if(id-17>=0 && id%8>=1 && board[id-17].piece==='♞') {
        piecesCheck.push(id-17);
    }
    if(id-15>=0 && id%8<7 && board[id-15].piece==='♞'){
        piecesCheck.push(id-15);
    }
    if(id-6>=0 && id%8<6 && board[id-6].piece==='♞'){
        piecesCheck.push(id-6);
    }
    if(id+10<=63&& id%8<6 && board[id+10].piece==='♞'){
        piecesCheck.push(id+10);
    }
    if(id+17<=63 && id%8<7 && board[id+17].piece==='♞'){
        piecesCheck.push(id+17);
    }
    if(id+15<=63 && id%8>0 && board[id+15].piece==='♞'){
        piecesCheck.push(id+15);
    }
    if(id+6<=63 && id%8>1 && board[id+6].piece==='♞'){
        piecesCheck.push(id+6);
    }


    return piecesCheck;
}
function positionBlackIsCheck(position,board = boardObjects){
    const id = position;
    const piecesCheck = [];
    let left = id+1;
    while(left<=63 &&left%8>id%8 && P_White.includes(board[left].piece)===false && P_Black.includes(board[left].piece)===false)
    {
        left++;
    }
    if(left<=63 &&left%8>id%8 && P_White.includes(board[left].piece)===true )
    {
        const p = board[left].piece.trim();
        if(p==='♖' || p==='♕')
        {
            piecesCheck.push(left);
        }
    }

    let right = id-1;
    while(right>=0 && right%8<id%8 &&  P_White.includes(board[right].piece)===false && P_Black.includes(board[right].piece)===false)
    {
        right--;
    }
    if(right>=0 && right%8<id%8 && P_White.includes(board[right].piece)===true)
    {
        const p = board[right].piece.trim();
        if(p==='♖' || p==='♕')
        {
            piecesCheck.push(right);
        }
    }

    let top = id-8;
    while(top>=0 && P_White.includes(board[top].piece)===false && P_Black.includes(board[top].piece)===false)
    {
        top-=8;
    }
    if(top>=0 && P_White.includes(board[top].piece)===true)
    {
        const p = board[top].piece.trim();
        if(p==='♖' || p==='♕')
        {
            piecesCheck.push(top);
        }
    }

    let bottom = id+8;
    while(bottom<=63 && P_White.includes(board[bottom].piece)===false && P_Black.includes(board[bottom].piece)===false)
    {
        bottom+=8;
    }
    if(bottom<=63 && P_White.includes(board[bottom].piece)===true)
    {
        const p = board[bottom].piece.trim();
        if(p==='♖' || p==='♕')
        {
            piecesCheck.push(bottom);
        }
    }

    
    let topLeft = id-9;
    while(topLeft%8<id%8 && topLeft>=0 && P_White.includes(board[topLeft].piece)===false && P_Black.includes(board[topLeft].piece)===false)
    {
        topLeft-=9;
    }
    if(topLeft%8<id%8 && topLeft>=0 &&  P_White.includes(board[topLeft].piece)===true)
    {
        const p = board[topLeft].piece.trim();
        if(p==='♗' || p==='♕')
        {
            piecesCheck.push(topLeft);
        }
    }

    let topRight = id-7;
    while(topRight%8>id%8 && topRight>=0 && P_White.includes(board[topRight].piece)===false && P_Black.includes(board[topRight].piece)===false)
    {
        topRight-=7;
    }
    if(topRight%8>id%8 && topRight>=0 &&  P_White.includes(board[topRight].piece)===true)
    {
        const p = board[topRight].piece.trim();
        if(p==='♗' || p==='♕')
        {
            piecesCheck.push(topRight);
        }
        
    }

    let bottomLeft = id+7;
    while(bottomLeft%8<id%8 && bottomLeft<=63 && P_White.includes(board[bottomLeft].piece)===false && P_Black.includes(board[bottomLeft].piece)===false)
    {
        bottomLeft+=7;
    }
    if(bottomLeft%8<id%8 && bottomLeft<=63 &&  P_White.includes(board[bottomLeft].piece)===true)
    {
        const p = board[bottomLeft].piece.trim();
        if(p==='♗' || p==='♕')
        {
            piecesCheck.push(bottomLeft);
        }
        if(bottomLeft === id+7 && p==='♙')
        {
            piecesCheck.push(bottomLeft);
        }
    }

    let bottomRight = id+9;
    while(bottomRight%8>id%8 && bottomRight<=63 && P_White.includes(board[bottomRight].piece)===false && P_Black.includes(board[bottomRight].piece)===false)
    {
        bottomRight+=9;
    }
    if(bottomRight%8>id%8 && bottomRight<=63 &&  P_White.includes(board[bottomRight].piece)===true)
    {
        const p = board[bottomRight].piece.trim();
        if(p==='♗' || p==='♕')
        {
            piecesCheck.push(bottomRight);
        }
        if(bottomRight === id+9 && p==='♙')
        {
            piecesCheck.push(bottomRight);
        }
    }

    if(id-10>=0 && id%8>=2 && board[id-10].piece==='♘'){
        piecesCheck.push(id-10);
    }
    if(id-17>=0 && id%8>=1 && board[id-17].piece==='♘') {
        piecesCheck.push(id-17);
    }
    if(id-15>=0 && id%8<7 && board[id-15].piece==='♘'){
        piecesCheck.push(id-15);
    }
    if(id-6>=0 && id%8<6 && board[id-6].piece==='♘'){
        piecesCheck.push(id-6);
    }
    if(id+10<=63&& id%8<6 && board[id+10].piece==='♘'){
        piecesCheck.push(id+10);
    }
    if(id+17<=63 && id%8<7 && board[id+17].piece==='♘'){
        piecesCheck.push(id+17);
    }
    if(id+15<=63 && id%8>0 && board[id+15].piece==='♘'){
        piecesCheck.push(id+15);
    }
    if(id+6<=63 && id%8>1 && board[id+6].piece==='♘'){
        piecesCheck.push(id+6);
    }


    return piecesCheck;
}



function checkmateWhite()
{   
    let count = 0;
    for(const piece of PiecesWhite)
    {   
        let index = boardObjects.findIndex( obj => obj.id === piece && P_White.includes(obj.piece))
        if(index!==-1){
            switch(boardObjects[index].piece)
                {
                    case '♙':
                    {
                       const nr = index;
                        
                        
                        if( P_White.includes(boardObjects[nr-8].piece)===false && P_Black.includes(boardObjects[nr-8].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-8;
                            boardObjectsCopy[nr-8].position = nr;
                            swap(boardObjectsCopy,nr-8,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }  
                        }
                        if(nr%8<7 && P_Black.includes(boardObjects[nr-7].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-7;
                            boardObjectsCopy[nr-7] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,nr-7,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            } 
                        } 
                        if(nr%8>0 && P_Black.includes(boardObjects[nr-9].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-9;
                            boardObjectsCopy[nr-9] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,nr-9,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            } 
                        }

                        if(boardObjects[nr].firstMove===false && nr-16>=0)//inca n-am facut prima mutare
                        {   
                            if(P_White.includes(boardObjects[nr-16].piece)===false && P_Black.includes(boardObjects[nr-16].piece)===false
                                && boardObjects[nr-8].id==='empty')
                            {
                                boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                                boardObjectsCopy[nr].position = nr-16;
                                boardObjectsCopy[nr-16].position = nr;
                                swap(boardObjectsCopy,nr-16,nr);
                                if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                                {
                                    count++;
                                }
                            }
                        }
                        break;
                    }
                    case '♖':
                    {
                       const nr = index;
                        
                        let c = parseInt(nr/8)*8;
                        let goLeft = nr%8-1 ,goRight = nr%8+1;
                        let goTop = nr-8 , goBottom = nr+8;
                        
                        while(goLeft>=0 && P_Black.includes(boardObjects[c+goLeft].piece)===false && P_White.includes(boardObjects[c+goLeft].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft].position = nr;
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goLeft--;
                        }
                        if(goLeft>=0 && P_Black.includes(boardObjects[c+goLeft].piece)===true)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goRight<8 &&  P_Black.includes(boardObjects[c+goRight].piece)===false && P_White.includes(boardObjects[c+goRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight].position = nr;
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goRight++;
                        }
                        if(goRight<8 &&  P_Black.includes(boardObjects[c+goRight].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goTop>=0 && P_Black.includes(boardObjects[goTop].piece)===false && P_White.includes(boardObjects[goTop].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop].position = nr;
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goTop-=8;
                        }
                        if(goTop>=0 &&P_Black.includes(boardObjects[goTop].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goBottom<=63 && P_Black.includes(boardObjects[goBottom].piece)===false && P_White.includes(boardObjects[goBottom].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom].position = nr;
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goBottom+=8;
                        }
                        if(goBottom<=63&&P_Black.includes(boardObjects[goBottom].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        break;
                    }
                    case '♘':
                    {    
                       const nr = index;
                        
                        if(nr%8>=2 && nr-10>=0 &&  P_White.includes(boardObjects[nr-10].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-10;
                            if(P_Black.includes(boardObjects[nr-10].piece)===true)
                            {
                                boardObjectsCopy[nr-10] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-10].position = nr;
                            }
                            swap(boardObjectsCopy,nr-10,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            } 
                        }

                        if(nr%8>=1 && nr-17>=0 &&P_White.includes(boardObjects[nr-17].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-17;
                            if(P_Black.includes(boardObjects[nr-17].piece)===true)
                            {
                                boardObjectsCopy[nr-17] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-17].position = nr;
                            }
                            swap(boardObjectsCopy,nr-17,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            } 
                        }

                        if(nr%8<=6 && nr-15>=0 &&  P_White.includes(boardObjects[nr-15].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-15;
                            if(P_Black.includes(boardObjects[nr-15].piece)===true)
                            {
                                boardObjectsCopy[nr-15] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-15].position = nr;
                            }
                            swap(boardObjectsCopy,nr-15,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            } 
                        }

                        if(nr%8<=5 && nr-6>=0 && P_White.includes(boardObjects[nr-6].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-6;
                            if(P_Black.includes(boardObjects[nr-6].piece)===true)
                            {
                                boardObjectsCopy[nr-6] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-6].position = nr;
                            }
                            swap(boardObjectsCopy,nr-6,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            } 
                        }

                        if(nr%8<=6 && nr+17<=63 &&  P_White.includes(boardObjects[nr+17].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+17;
                            if(P_Black.includes(boardObjects[nr+17].piece)===true)
                            {
                                boardObjectsCopy[nr+17] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+17].position = nr;
                            }
                            swap(boardObjectsCopy,nr+17,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            } 
                        }

                        if(nr%8<=5 && nr+10<=63 && P_White.includes(boardObjects[nr+10].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+10;
                            if(P_Black.includes(boardObjects[nr+10].piece)===true)
                            {
                                boardObjectsCopy[nr+10] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+10].position = nr;
                            }
                            swap(boardObjectsCopy,nr+10,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            } 
                        }

                        if(nr%8>=1 && nr+15<=63 && P_White.includes(boardObjects[nr+15].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+15;
                            if(P_Black.includes(boardObjects[nr+15].piece)===true)
                            {
                                boardObjectsCopy[nr+15] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+15].position = nr;
                            }
                            swap(boardObjectsCopy,nr+15,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            } 
                        }

                        if(nr%8>=2 && nr+6<=63 && P_White.includes(boardObjects[nr+6].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+6;
                            if(P_Black.includes(boardObjects[nr+6].piece)===true)
                            {
                                boardObjectsCopy[nr+6] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+6].position = nr;
                            }
                            swap(boardObjectsCopy,nr+6,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            } 
                        }
                        break;
                    }
                    case '♗':
                    {
                       const nr = index;
                        
                        let goTopLeft = nr-9 , goTopRight = nr-7;
                        
                        while(goTopLeft>=0&&goTopLeft%8<nr%8 && P_Black.includes(boardObjects[goTopLeft].piece)===false && P_White.includes(boardObjects[goTopLeft].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft].position = nr;
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goTopLeft-=9;
                        }
                        if(goTopLeft>=0 &&((goTopLeft%8===0&&P_White.includes(boardObjects[goTopLeft].piece)===false) || (P_Black.includes(boardObjects[goTopLeft].piece)===true && goTopLeft%8<nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        
                        while(goTopRight>=0&&goTopRight%8>nr%8 && P_Black.includes(boardObjects[goTopRight].piece)===false && P_White.includes(boardObjects[goTopRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight].position = nr;
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goTopRight-=7;
                        }
                        if(goTopRight>=0 &&((goTopRight%8===7&& P_White.includes(boardObjects[goTopRight].piece)===false) || (P_Black.includes(boardObjects[goTopRight].piece)===true && goTopRight%8>nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }


                        let goBottomLeft = nr+7, goBottomRight = nr+9;
                        while(goBottomLeft<=63 && goBottomLeft%8<nr%8 && P_Black.includes(boardObjects[goBottomLeft].piece)===false && P_White.includes(boardObjects[goBottomLeft].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft].position = nr;
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goBottomLeft+=7;
                        }
                        if((goBottomLeft<=63&&goBottomLeft%8<nr%8&&P_White.includes(boardObjects[goBottomLeft].piece)===false) || (goBottomLeft<=63 && goBottomLeft%8<nr%8 && P_Black.includes(boardObjects[goBottomLeft].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goBottomRight<=63 && goBottomRight%8>nr%8 &&P_Black.includes(boardObjects[goBottomRight].piece)===false && P_White.includes(boardObjects[goBottomRight].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight].position = nr;
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goBottomRight+=9;
                        }
                        if((goBottomRight<=63&&goBottomRight%8>nr%8&&P_White.includes(boardObjects[goBottomRight].piece)===false) ||  (goBottomRight<=63 && goBottomRight%8>nr%8 && P_Black.includes(boardObjects[goBottomRight].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        } 
                        break;
                    }
                    case '♕':
                    {
                       const nr = index;
                        
                        let c = parseInt(nr/8)*8;
                        let goLeft = nr%8-1 ,goRight = nr%8+1;
                        let goTop = nr-8 , goBottom = nr+8;
                        
                        while(goLeft>=0 && P_Black.includes(boardObjects[c+goLeft].piece)===false && P_White.includes(boardObjects[c+goLeft].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft].position = nr;
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goLeft--;
                        }
                        if(goLeft>=0 && P_Black.includes(boardObjects[c+goLeft].piece)===true)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goRight<8 &&  P_Black.includes(boardObjects[c+goRight].piece)===false && P_White.includes(boardObjects[c+goRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight].position = nr;
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goRight++;
                        }
                        if(goRight<8 &&  P_Black.includes(boardObjects[c+goRight].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goTop>=0 && P_Black.includes(boardObjects[goTop].piece)===false && P_White.includes(boardObjects[goTop].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop].position = nr;
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goTop-=8;
                        }
                        if(goTop>=0 &&P_Black.includes(boardObjects[goTop].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goBottom<=63 && P_Black.includes(boardObjects[goBottom].piece)===false && P_White.includes(boardObjects[goBottom].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom].position = nr;
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goBottom+=8;
                        }
                        if(goBottom<=63&&P_Black.includes(boardObjects[goBottom].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        let goTopLeft = nr-9 , goTopRight = nr-7;
                        
                        while(goTopLeft>=0&&goTopLeft%8<nr%8 && P_Black.includes(boardObjects[goTopLeft].piece)===false && P_White.includes(boardObjects[goTopLeft].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft].position = nr;
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goTopLeft-=9;
                        }
                        if(goTopLeft>=0 &&((goTopLeft%8===0&&P_White.includes(boardObjects[goTopLeft].piece)===false) || (P_Black.includes(boardObjects[goTopLeft].piece)===true && goTopLeft%8<nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        
                        while(goTopRight>=0&&goTopRight%8>nr%8 && P_Black.includes(boardObjects[goTopRight].piece)===false && P_White.includes(boardObjects[goTopRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight].position = nr;
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goTopRight-=7;
                        }
                        if(goTopRight>=0 &&((goTopRight%8===7&& P_White.includes(boardObjects[goTopRight].piece)===false) || (P_Black.includes(boardObjects[goTopRight].piece)===true && goTopRight%8>nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }


                        let goBottomLeft = nr+7, goBottomRight = nr+9;
                        while(goBottomLeft<=63 && goBottomLeft%8<nr%8 && P_Black.includes(boardObjects[goBottomLeft].piece)===false && P_White.includes(boardObjects[goBottomLeft].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft].position = nr;
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goBottomLeft+=7;
                        }
                        if((goBottomLeft<=63&&goBottomLeft%8<nr%8&&P_White.includes(boardObjects[goBottomLeft].piece)===false) || (goBottomLeft<=63 && goBottomLeft%8<nr%8 && P_Black.includes(boardObjects[goBottomLeft].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goBottomRight<=63 && goBottomRight%8>nr%8 &&P_Black.includes(boardObjects[goBottomRight].piece)===false && P_White.includes(boardObjects[goBottomRight].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight].position = nr;
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goBottomRight+=9;
                        }
                        if((goBottomRight<=63&&goBottomRight%8>nr%8&&P_White.includes(boardObjects[goBottomRight].piece)===false) ||  (goBottomRight<=63 && goBottomRight%8>nr%8 && P_Black.includes(boardObjects[goBottomRight].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }         
                        break;
                    }
                    case '♔':
                    {
                       const nr = index;
                        
                        if(nr-1>=0 && (nr-1)%8<nr%8 && P_White.includes(boardObjects[nr-1].piece)===false )
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-1;
                            if(P_Black.includes(boardObjects[nr-1].piece)===true)
                            {
                                boardObjectsCopy[nr-1] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-1].position = nr;
                            }
                            swap(boardObjectsCopy,nr-1,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if( nr+1<=63 && (nr+1)%8>nr%8 && P_White.includes(boardObjects[nr+1].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+1;
                            if(P_Black.includes(boardObjects[nr+1].piece)===true)
                            {
                                boardObjectsCopy[nr+1] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+1].position = nr;
                            }
                            swap(boardObjectsCopy,nr+1,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if(nr-8>=0 &&P_White.includes(boardObjects[nr-8].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-8;
                            if(P_Black.includes(boardObjects[nr-8].piece)===true)
                            {
                                boardObjectsCopy[nr-8] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-8].position = nr;
                            }
                            swap(boardObjectsCopy,nr-8,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if(nr+8<=63 && P_White.includes(boardObjects[nr+8].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+8;
                            if(P_Black.includes(boardObjects[nr+8].piece)===true)
                            {
                                boardObjectsCopy[nr+8] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+8].position = nr;
                            }
                            swap(boardObjectsCopy,nr+8,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if((nr-9)%8<nr%8 && nr-9>=0 && P_White.includes(boardObjects[nr-9].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-9;
                            if(P_Black.includes(boardObjects[nr-9].piece)===true)
                            {
                                boardObjectsCopy[nr-9] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-9].position = nr;
                            }
                            swap(boardObjectsCopy,nr-9,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if((nr-7)%8>nr%8 && nr-7>=0 && P_White.includes(boardObjects[nr-7].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-7;
                            if(P_Black.includes(boardObjects[nr-7].piece)===true)
                            {
                                boardObjectsCopy[nr-7] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-7].position = nr;
                            }
                            swap(boardObjectsCopy,nr-7,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if((nr+9)%8>nr%8 && nr+9<=63 &&P_White.includes(boardObjects[nr+9].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+9;
                            if(P_Black.includes(boardObjects[nr+9].piece)===true)
                            {
                                boardObjectsCopy[nr+9] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+9].position = nr;
                            }
                            swap(boardObjectsCopy,nr+9,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if((nr+7)%8<nr%8 && nr+7<=63 && P_White.includes(boardObjects[nr+7].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+7;
                            if(P_Black.includes(boardObjects[nr+7].piece)===true)
                            {
                                boardObjectsCopy[nr+7] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+7].position = nr;
                            }
                            swap(boardObjectsCopy,nr+7,nr);
                            if(!positionWhiteIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♔').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        
                        
                        if(nr+3<=63 && positionWhiteIsCheck(nr).length===0 &&boardObjects[nr]?.firstMove===false && boardObjects[nr+3].piece ==='♖' && boardObjects[nr+3]?.firstMove===false &&
                            boardObjects[nr+1].id==='empty' && boardObjects[nr+2].id==='empty' && positionWhiteIsCheck(nr+1).length===0 && positionWhiteIsCheck(nr+2).length===0)
                        {
                            count++;
                        }
                        if(nr-4>=0 && positionWhiteIsCheck(nr).length===0 &&boardObjects[nr]?.firstMove===false && boardObjects[nr-4].piece ==='♖' && boardObjects[nr-4]?.firstMove===false &&
                            boardObjects[nr-1].id==='empty' && boardObjects[nr-2].id==='empty'&& boardObjects[nr-3].id==='empty' && positionWhiteIsCheck(nr-1).length===0 && positionWhiteIsCheck(nr-2).length===0)
                        {
                            count++;
                        }
                        break;
                    }
                    default:
                }
        }
        
    }
    return count;
}

function checkmateBlack()
{   
    let count = 0;
    for(const piece of PiecesBlack)
        {
            let index = boardObjects.findIndex( obj => obj.id === piece && P_Black.includes(obj.piece))
            if(index!==-1)
            {
                switch(boardObjects[index].piece)
                {
                    case '♟':
                    {
                       const nr = index;
                        
                
                        if( P_White.includes(boardObjects[nr+8].piece)===false && P_Black.includes(boardObjects[nr+8].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+8;
                            boardObjectsCopy[nr+8].position = nr;
                            swap(boardObjectsCopy,nr+8,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if(nr%8>0 && P_White.includes(boardObjects[nr+7].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+7;
                            boardObjectsCopy[nr+7] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,nr+7,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        } 
                        if(nr%8<7 && P_White.includes(boardObjects[nr+9].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+9;
                            boardObjectsCopy[nr+9] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,nr+9,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                
                        if(boardObjects[nr].firstMove===false)
                        {
                            if(P_Black.includes(boardObjects[nr+16].piece)===false && P_White.includes(boardObjects[nr+16].piece)===false
                            && boardObjects[nr+8].id==='empty')
                            {
                                boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                                boardObjectsCopy[nr].position = nr+16;
                                boardObjectsCopy[nr+16].position = nr;
                                swap(boardObjectsCopy,nr+16,nr);
                                if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                                {
                                    count++;
                                }
                            }
                        }
                        break;
                    }
                    case '♜':
                    {
                       const nr = index;
                        
                        let c = parseInt(nr/8)*8;
                        let goLeft = nr%8-1 ,goRight = nr%8+1;
                        let goTop = nr-8 , goBottom = nr+8;
                        
                        while(goLeft>=0 && P_Black.includes(boardObjects[c+goLeft].piece)===false && P_White.includes(boardObjects[c+goLeft].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft].position = nr;
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goLeft--;
                        }
                        if(goLeft>=0 && P_White.includes(boardObjects[c+goLeft].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goRight<8 &&  P_Black.includes(boardObjects[c+goRight].piece)===false && P_White.includes(boardObjects[c+goRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight].position = nr;
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goRight++;
                        }
                        if(goRight<8 &&  P_White.includes(boardObjects[c+goRight].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goTop>=0 && P_Black.includes(boardObjects[goTop].piece)===false && P_White.includes(boardObjects[goTop].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop].position = nr;
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goTop-=8;
                        }
                        if(goTop>=0 &&P_White.includes(boardObjects[goTop].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goBottom<=63 && P_Black.includes(boardObjects[goBottom].piece)===false && P_White.includes(boardObjects[goBottom].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom].position = nr;
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goBottom+=8;
                        }
                        if(goBottom<=63&&P_White.includes(boardObjects[goBottom].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        break;
                    }
                    case '♞':
                    {    
                       const nr = index;
                        
                        if(nr%8>=2 && nr-10>=0 && P_Black.includes(boardObjects[nr-10].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-10;
                            if(P_White.includes(boardObjects[nr-10].piece)===true)
                            {
                                boardObjectsCopy[nr-10] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-10].position = nr;
                            }
                            swap(boardObjectsCopy,nr-10,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        if(nr%8>=1 && nr-17>=0 && P_Black.includes(boardObjects[nr-17].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-17;
                            if(P_White.includes(boardObjects[nr-17].piece)===true)
                            {
                                boardObjectsCopy[nr-17] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-17].position = nr;
                            }
                            swap(boardObjectsCopy,nr-17,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        if(nr%8<=6 && nr-15>=0 && P_Black.includes(boardObjects[nr-15].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-15;
                            if(P_White.includes(boardObjects[nr-15].piece)===true)
                            {
                                boardObjectsCopy[nr-15] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-15].position = nr;
                            }
                            swap(boardObjectsCopy,nr-15,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        if(nr%8<=5 && nr-6>=0 &&P_Black.includes(boardObjects[nr-6].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-6;
                            if(P_White.includes(boardObjects[nr-6].piece)===true)
                            {
                                boardObjectsCopy[nr-6] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-6].position = nr;
                            }
                            swap(boardObjectsCopy,nr-6,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        if(nr%8<=6 && nr+17<=63 &&  P_Black.includes(boardObjects[nr+17].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+17;
                            if(P_White.includes(boardObjects[nr+17].piece)===true)
                            {
                                boardObjectsCopy[nr+17] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+17].position = nr;
                            }
                            swap(boardObjectsCopy,nr+17,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        if(nr%8<=5 && nr+10<=63 &&  P_Black.includes(boardObjects[nr+10].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+10;
                            if(P_White.includes(boardObjects[nr+10].piece)===true)
                            {
                                boardObjectsCopy[nr+10] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+10].position = nr;
                            }
                            swap(boardObjectsCopy,nr+10,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        if(nr%8>=1 && nr+15<=63 &&  P_Black.includes(boardObjects[nr+15].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+15;
                            if(P_White.includes(boardObjects[nr+15].piece)===true)
                            {
                                boardObjectsCopy[nr+15] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+15].position = nr;
                            }
                            swap(boardObjectsCopy,nr+15,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        if(nr%8>=2 && nr+6<=63 &&  P_Black.includes(boardObjects[nr+6].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+6;
                            if(P_White.includes(boardObjects[nr+6].piece)===true)
                            {
                                boardObjectsCopy[nr+6] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+6].position = nr;
                            }
                            swap(boardObjectsCopy,nr+6,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        break;
                    }
                    case '♝':
                    {
                       const nr = index;
                        
                        let goTopLeft = nr-9 , goTopRight = nr-7;
                        
                        while(goTopLeft>=0&&goTopLeft%8<nr%8 && P_Black.includes(boardObjects[goTopLeft].piece)===false && P_White.includes(boardObjects[goTopLeft].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft].position = nr;
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goTopLeft-=9;
                        }
                        if(goTopLeft>=0 &&((goTopLeft%8===0&&P_Black.includes(boardObjects[goTopLeft].piece)===false) || (P_White.includes(boardObjects[goTopLeft].piece)===true && goTopLeft%8<nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        
                        while(goTopRight>=0&&goTopRight%8>nr%8 && P_Black.includes(boardObjects[goTopRight].piece)===false && P_White.includes(boardObjects[goTopRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight].position = nr;
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goTopRight-=7;
                        }
                        if(goTopRight>=0 &&((goTopRight%8===7&& P_Black.includes(boardObjects[goTopRight].piece)===false) || (P_White.includes(boardObjects[goTopRight].piece)===true && goTopRight%8>nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }


                        let goBottomLeft = nr+7, goBottomRight = nr+9;
                        while(goBottomLeft<=63 && goBottomLeft%8<nr%8 && P_Black.includes(boardObjects[goBottomLeft].piece)===false && P_White.includes(boardObjects[goBottomLeft].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft].position = nr;
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goBottomLeft+=7;
                        }
                        if((goBottomLeft<=63&&goBottomLeft%8<nr%8&&P_Black.includes(boardObjects[goBottomLeft].piece)===false) || (goBottomLeft%8<nr%8 && P_White.includes(boardObjects[goBottomLeft].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goBottomRight<=63 && goBottomRight%8>nr%8 &&P_Black.includes(boardObjects[goBottomRight].piece)===false && P_White.includes(boardObjects[goBottomRight].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight].position = nr;
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goBottomRight+=9;
                        }
                        if((goBottomRight<=63&&goBottomRight%8>nr%8&&P_Black.includes(boardObjects[goBottomRight].piece)===false) ||  (goBottomRight%8>nr%8 && P_White.includes(boardObjects[goBottomRight].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        } 
                        break;
                    }
                    case '♛':
                    {
                       const nr = index;
                        
                        let c = parseInt(nr/8)*8;
                        let goLeft = nr%8-1 ,goRight = nr%8+1;
                        let goTop = nr-8 , goBottom = nr+8;
                        
                        while(goLeft>=0 && P_Black.includes(boardObjects[c+goLeft].piece)===false && P_White.includes(boardObjects[c+goLeft].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft].position = nr;
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goLeft--;
                        }
                        if(goLeft>=0 && P_White.includes(boardObjects[c+goLeft].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goLeft;
                            boardObjectsCopy[c+goLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goRight<8 &&  P_Black.includes(boardObjects[c+goRight].piece)===false && P_White.includes(boardObjects[c+goRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight].position = nr;
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goRight++;
                        }
                        if(goRight<8 &&  P_White.includes(boardObjects[c+goRight].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = c+goRight;
                            boardObjectsCopy[c+goRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,c+goRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goTop>=0 && P_Black.includes(boardObjects[goTop].piece)===false && P_White.includes(boardObjects[goTop].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop].position = nr;
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goTop-=8;
                        }
                        if(goTop>=0 &&P_White.includes(boardObjects[goTop].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTop;
                            boardObjectsCopy[goTop] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTop,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goBottom<=63 && P_Black.includes(boardObjects[goBottom].piece)===false && P_White.includes(boardObjects[goBottom].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom].position = nr;
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goBottom+=8;
                        }
                        if(goBottom<=63&&P_White.includes(boardObjects[goBottom].piece)===true)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottom;
                            boardObjectsCopy[goBottom] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottom,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        let goTopLeft = nr-9 , goTopRight = nr-7;
                        
                        while(goTopLeft>=0&&goTopLeft%8<nr%8 && P_Black.includes(boardObjects[goTopLeft].piece)===false && P_White.includes(boardObjects[goTopLeft].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft].position = nr;
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goTopLeft-=9;
                        }
                        if(goTopLeft>=0 &&((goTopLeft%8===0&&P_Black.includes(boardObjects[goTopLeft].piece)===false) || (P_White.includes(boardObjects[goTopLeft].piece)===true && goTopLeft%8<nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopLeft;
                            boardObjectsCopy[goTopLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        
                        while(goTopRight>=0&&goTopRight%8>nr%8 && P_Black.includes(boardObjects[goTopRight].piece)===false && P_White.includes(boardObjects[goTopRight].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight].position = nr;
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goTopRight-=7;
                        }
                        if(goTopRight>=0 &&((goTopRight%8===7&& P_Black.includes(boardObjects[goTopRight].piece)===false) || (P_White.includes(boardObjects[goTopRight].piece)===true && goTopRight%8>nr%8)))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goTopRight;
                            boardObjectsCopy[goTopRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goTopRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }


                        let goBottomLeft = nr+7, goBottomRight = nr+9;
                        while(goBottomLeft<=63 && goBottomLeft%8<nr%8 && P_Black.includes(boardObjects[goBottomLeft].piece)===false && P_White.includes(boardObjects[goBottomLeft].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft].position = nr;
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goBottomLeft+=7;
                        }
                        if((goBottomLeft<=63&&goBottomLeft%8<nr%8&&P_Black.includes(boardObjects[goBottomLeft].piece)===false) || (goBottomLeft<=63&&goBottomLeft%8<nr%8 && P_White.includes(boardObjects[goBottomLeft].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomLeft;
                            boardObjectsCopy[goBottomLeft] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomLeft,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }

                        while(goBottomRight<=63 && goBottomRight%8>nr%8 &&P_Black.includes(boardObjects[goBottomRight].piece)===false && P_White.includes(boardObjects[goBottomRight].piece)===false)
                        {   
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight].position = nr;
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            goBottomRight+=9;
                        }
                        if((goBottomRight<=63&&goBottomRight%8>nr%8&&P_Black.includes(boardObjects[goBottomRight].piece)===false) ||  (goBottomRight<=63&&goBottomRight%8>nr%8 && P_White.includes(boardObjects[goBottomRight].piece)===true))
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = goBottomRight;
                            boardObjectsCopy[goBottomRight] = {
                                piece:'',
                                id:'empty',
                                position:nr
                            };
                            swap(boardObjectsCopy,goBottomRight,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        break;
                    }
                    case '♚':
                    {
                       const nr = index;
                        
                        if(nr-1>=0 && (nr-1)%8<nr%8 && P_Black.includes(boardObjects[nr-1].piece)===false )
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-1;
                            if(P_White.includes(boardObjects[nr-1].piece)===true)
                            {
                                boardObjectsCopy[nr-1] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-1].position = nr;
                            }
                            swap(boardObjectsCopy,nr-1,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if( nr+1<=63 && (nr+1)%8>nr%8 && P_Black.includes(boardObjects[nr+1].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+1;
                            if(P_White.includes(boardObjects[nr+1].piece)===true)
                            {
                                boardObjectsCopy[nr+1] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+1].position = nr;
                            }
                            swap(boardObjectsCopy,nr+1,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if(nr-8>=0 &&P_Black.includes(boardObjects[nr-8].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-8;
                            if(P_White.includes(boardObjects[nr-8].piece)===true)
                            {
                                boardObjectsCopy[nr-8] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-8].position = nr;
                            }
                            swap(boardObjectsCopy,nr-8,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if(nr+8<=63 && P_Black.includes(boardObjects[nr+8].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+8;
                            if(P_White.includes(boardObjects[nr+8].piece)===true)
                            {
                                boardObjectsCopy[nr+8] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+8].position = nr;
                            }
                            swap(boardObjectsCopy,nr+8,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if((nr-9)%8<nr%8 && nr-9>=0 && P_Black.includes(boardObjects[nr-9].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-9;
                            if(P_White.includes(boardObjects[nr-9].piece)===true)
                            {
                                boardObjectsCopy[nr-9] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-9].position = nr;
                            }
                            swap(boardObjectsCopy,nr-9,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if((nr-7)%8>nr%8 && nr-7>=0 && P_Black.includes(boardObjects[nr-7].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr-7;
                            if(P_White.includes(boardObjects[nr-7].piece)===true)
                            {
                                boardObjectsCopy[nr-7] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr-7].position = nr;
                            }
                            swap(boardObjectsCopy,nr-7,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        if((nr+9)%8>nr%8 && nr+9<=63 &&P_Black.includes(boardObjects[nr+9].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+9;
                            if(P_White.includes(boardObjects[nr+9].piece)===true)
                            {
                                boardObjectsCopy[nr+9] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+9].position = nr;
                            }
                            swap(boardObjectsCopy,nr+9,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                            
                        }
                        if((nr+7)%8<nr%8 && nr+7<=63 && P_Black.includes(boardObjects[nr+7].piece)===false)
                        {
                            boardObjectsCopy = JSON.parse(JSON.stringify(boardObjects));
                            boardObjectsCopy[nr].position = nr+7;
                            if(P_White.includes(boardObjects[nr+7].piece)===true)
                            {
                                boardObjectsCopy[nr+7] = {
                                    piece:'',
                                    id:'empty',
                                    position:nr
                                };
                            }
                            else{
                                boardObjectsCopy[nr+7].position = nr;
                            }
                            swap(boardObjectsCopy,nr+7,nr);
                            if(!positionBlackIsCheck(boardObjectsCopy.find(obj => obj.piece ==='♚').position,boardObjectsCopy).length)
                            {
                                count++;
                            }
                        }
                        
                        if(nr+3<=63 && positionBlackIsCheck(nr).length===0 &&boardObjects[nr].firstMove===false && boardObjects[nr+3].piece ==='♜' && boardObjects[nr+3].firstMove===false &&
                                boardObjects[nr+1].id==='empty' && boardObjects[nr+2].id==='empty' && positionBlackIsCheck(nr+1).length===0 && positionBlackIsCheck(nr+2).length===0)
                            {   
                                count++;
                            }
                        if(nr-4>=0 && positionBlackIsCheck(nr).length===0 &&boardObjects[nr].firstMove===false && boardObjects[nr-4].piece ==='♜' && boardObjects[nr-4].firstMove===false &&
                                boardObjects[nr-1].id==='empty' && boardObjects[nr-2].id==='empty'&& boardObjects[nr-3].id==='empty' && positionBlackIsCheck(nr-1).length===0 && positionBlackIsCheck(nr-2).length===0)
                            {
                                count++;
                            }

                        break;
                    }
                    default:
                }
            }
                
        }
    return count;
}
