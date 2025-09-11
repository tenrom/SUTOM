let tiles=[]
let index=0
let word=''
let win=false
let rng=''


function FixSeed(seed){
    rng=new Math.seedrandom(seed)
}

function getWord(){
    fetch("drawable-words.json")
        .then((res) => res.json())
        .then((json) => {
            console.log(json)
            word=json[Math.round(rng()*(json.length-1))]


            word="TERRE"
        })
        .catch((e) => console.error(e))
}


FixSeed(new Date().toDateString())
getWord()



class Tile extends HTMLElement{
    constructor (){
        super()
    }
    AddLetter(l){
        if (this.querySelector('.text').innerText===''){
            index++
        }
        this.querySelector('.text').innerText=l
        this.text=l
        this.querySelector('.tile').style.borderColor='#646464'
    }
    RemoveLetter(){
        if (this.querySelector('.text').innerText!==''){
            index--
        }
        this.querySelector('.text').innerText=''
        this.text=''
        this.querySelector('.tile').style.borderColor=''
        this.querySelector('.tile').classList.add('currenttile')
    }
    Colorize(c){
        if (c==='green'){
            this.querySelector('.tile').style.backgroundColor='#3eaa42'
            this.querySelector('.tile').style.borderColor='#3eaa42'
        }
        if (c==='orange'){
            this.querySelector('.tile').style.backgroundColor='#cd8729'
            this.querySelector('.tile').style.borderColor='#cd8729'
        }
        if (c==='gray'){
            this.querySelector('.tile').style.backgroundColor='#3a3a3c'
            this.querySelector('.tile').style.borderColor='#3a3a3c'
        }
    }
    Flip(delay=0,c=''){
        this.style.animation='none'
        this.querySelector('.text').style.transform='rotateX(0deg)'

        setTimeout(()=>{
            this.style.animation=``
            this.style.animationDelay=delay+'ms'  
        },50)

        setTimeout(()=>{
            if (c){
                this.Colorize(c)
            }
            this.querySelector('.text').style.transform='rotateX(180deg)'
        },300+delay)
        
    }
    connectedCallback(){
        this.text=''
        tiles.push(this)
        this.classList.add('game-tile')
        this.innerHTML=`
            <div id='tile'><div id='text' class='text'></div></div>
        `
        this.getElementsByTagName('div')[0].classList.add('tile')
    }
}

class Line extends HTMLElement{
    constructor (){
        super()
    }
    connectedCallback(){
        this.innerHTML=`
            <div id='line'>${'<game-tile></game-tile>'.repeat(this.getAttribute('tilenb'))}</div>
        `
        this.getElementsByTagName('div')[0].classList.add('line')
    }
}

class Game extends HTMLElement{
    constructor (){
        super()
    }
    connectedCallback(){
        this.innerHTML=`
            <div id='Grid'>${`<game-line tilenb='${this.getAttribute('tilenb')}'></game-line>`.repeat(this.getAttribute('attemps'))}</div>
        `
        this.getElementsByTagName('div')[0].classList.add('Grid')
    }
}

function AddingLetter(l){
    if (index!==5){
        tiles[index].querySelector('.tile').classList.remove('currenttile')
        tiles[index].AddLetter(l)
        if (index!==5){
            tiles[index].querySelector('.tile').classList.add('currenttile')
        }
    }   
}

function RemovingLetter(){
    try{tiles[index-1].RemoveLetter()}catch{}
    try{tiles[index+1].querySelector('.tile').classList.remove('currenttile')}catch{}
    
}

function InDic(word,after){
    fetch("mots.txt")
        .then((res) => res.text())
        .then((text) => {
            after(text.match(new RegExp("\\b" + word + "\\b")) != null)
        })
        .catch((e) => console.error(e))
}

function TryWord(){
    let nword=word
    let currentword=''
    for (let i in tiles.slice(0,5)){
        currentword+=tiles[i].text
    }
    console.log(currentword)
    InDic(currentword,(valid)=>{
        if (valid){
            let lettersG={}
            let lettersO={}
            for (let i in tiles.slice(0,5)){
                if (word[i]!==tiles[i].text && word.includes(tiles[i].text)){
                    if (lettersO[tiles[i].text]){
                        lettersO[tiles[i].text]+=1
                    }else{
                        lettersO[tiles[i].text]=1
                    }
                }else{
                    if (word[i]===tiles[i].text){
                        if (lettersG[tiles[i].text]){
                            lettersG[tiles[i].text]+=1
                        }else{
                            lettersG[tiles[i].text]=1
                        }
                    }
                    
                }
            }
            console.log(lettersG,lettersO)
            for (let i in tiles.slice(0,5)){
                let c='gray'
                if (word[i]===tiles[i].text){
                    c='green'
                    nword=nword.replace(tiles[i].text,'')
                }else{
                    if (nword.includes(tiles[i].text) && lettersO[tiles[i].text]){
                        nb=word.match(new RegExp(`${tiles[i].text}`,'g')).length
                        nbg=0
                        if (lettersG[tiles[i].text]){
                            nbg=lettersG[tiles[i].text]
                        }
                        if ((nb-nbg)>=1){
                            c='orange'
                            nword=nword.replace(tiles[i].text,'')
                            lettersO[tiles[i].text]-=1
                        }
                    }
                }
                
                tiles[i].Flip(i%5*400,c)
            }

            tiles.splice(0,5)
            if (word!==currentword){
                index=0
                try{tiles[index].querySelector('.tile').classList.add('currenttile')}catch{}
            }else{
                win=true
            }
        }
    })
    
}

window.addEventListener('load',()=>{
    tiles[index].querySelector('.tile').classList.add('currenttile')

    for (let i in tiles){
        tiles[i].Flip(i%5*400)
    }
    
})

document.addEventListener('keydown',(e)=>{
    if ('abcdefghijklmnopqrstuvwxyz'.includes(e.key)){
        AddingLetter(e.key.toUpperCase())
    }
    if (e.key==='Enter'){
        if (index===5 && !win){
            TryWord()
        }
    }
    if (e.key==='Backspace'){
        RemovingLetter()
    }
})


window.customElements.define("game-tile",Tile)
window.customElements.define("game-line",Line)
window.customElements.define("game-grid",Game)


