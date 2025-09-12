let tiles=[]
let index=0
let word=''
let win=false
let rng=''

let keys={}
let a='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
for (let i in a){
    keys[a[i]]='none'
}

function FixSeed(seed){
    rng=new Math.seedrandom(seed)
}

function getWord(){
    fetch("drawable-words.json")
        .then((res) => res.json())
        .then((json) => {
            console.log(json)
            word=json[Math.round(rng()*(json.length-1))]
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
    Anim(){
        this.style.animation='none'
        this.querySelector('.text').style.transform='translateX(0deg)'

        setTimeout(()=>{
            this.style.animation=` invalid 400ms cubic-bezier(.61,1.01,.39,-0.01)`
        },50)
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

class Keyboard extends HTMLElement{
    constructor (){
        super()
    }
    connectedCallback(){
        this.innerHTML=`
            <div id='Keyboard'></div>
        `
        let letters=[
            ['A','Z','E','R','T','Y','U','I','O','P'],
            ['Q','S','D','F','G','H','J','K','L','M'],
            ['->','W','X','C','V','B','N','<-']
        ]
        let keyb=this.getElementsByTagName('div')[0]
        for (let y in letters){
            for (let x in letters[y]){
                if (letters[y][x]==='->' || letters[y][x]==='<-'){
                    keyb.innerHTML+=`<game-key data-text='${letters[y][x]}' style='grid-column:span 2;'></game-key>`
                }else{
                    keyb.innerHTML+=`<game-key data-text='${letters[y][x]}'></game-key>`
                }
                
            }
        }
        keyb.classList.add('Keyboard')
    }
}

class Key extends HTMLElement{
    constructor (){
        super()
    }
    connectedCallback(){
        this.innerHTML=`
            <div id='Key${this.getAttribute('data-text')}'>${this.getAttribute('data-text')}</div>
        `

        if (this.getAttribute('data-text')==='<-'){
            this.getElementsByTagName('div')[0].innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="currentColor" d="m14 13.4l1.9 1.9q.275.275.7.275t.7-.275t.275-.7t-.275-.7L15.4 12l1.9-1.9q.275-.275.275-.7t-.275-.7t-.7-.275t-.7.275L14 10.6l-1.9-1.9q-.275-.275-.7-.275t-.7.275t-.275.7t.275.7l1.9 1.9l-1.9 1.9q-.275.275-.275.7t.275.7t.7.275t.7-.275zM9 20q-.475 0-.9-.213t-.7-.587l-4.5-6q-.4-.525-.4-1.2t.4-1.2l4.5-6q.275-.375.7-.587T9 4h11q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm0-2h11V6H9l-4.5 6zm3.25-6"/></svg>`
        }
        if (this.getAttribute('data-text')==='->'){
            this.getElementsByTagName('div')[0].innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="currentColor" d="m6.8 13l2.9 2.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-4.6-4.6q-.15-.15-.213-.325T3.426 12t.063-.375t.212-.325l4.6-4.6q.275-.275.7-.275t.7.275t.275.7t-.275.7L6.8 11H19V8q0-.425.288-.712T20 7t.713.288T21 8v3q0 .825-.587 1.413T19 13z" stroke-width="0.8" stroke="currentColor"/></svg>`
        }
        this.getElementsByTagName('div')[0].classList.add('Key')
        this.addEventListener('click',()=>{

            if (this.getAttribute('data-text')==='<-' ){
                RemovingLetter()
            }else{
                if (this.getAttribute('data-text')==='->' ){
                    if (index===5 && !win){
                        TryWord()
                    }
                }else{
                    AddingLetter(this.getAttribute('data-text').toUpperCase())
                }
            }
        })
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
    if (!win){
        try{tiles[index-1].RemoveLetter()}catch{}
        try{tiles[index+1].querySelector('.tile').classList.remove('currenttile')}catch{}
    }
}

function InDic(word,after){
    fetch("mots.txt")
        .then((res) => res.text())
        .then((text) => {
            after(text.match(new RegExp("\\b" + word + "\\b")) != null)
        })
        .catch((e) => console.error(e))
}

function ColoredKeyBoard(){
    for (let i in keys){
        document.getElementById('Key'+i).classList.add('Key'+keys[i])
    }
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
                    keys[tiles[i].text]='Green'
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
                            if (keys[tiles[i].text]==='none'){
                                keys[tiles[i].text]='Orange'
                            }
                            nword=nword.replace(tiles[i].text,'')
                            lettersO[tiles[i].text]-=1
                        }
                    }else{
                        if (keys[tiles[i].text]==='none'){
                            keys[tiles[i].text]='Gray'
                        }
                    }
                }
                
                tiles[i].Flip(i%5*400,c)
                
                ColoredKeyBoard()
            }

            tiles.splice(0,5)
            if (word!==currentword){
                index=0
                try{tiles[index].querySelector('.tile').classList.add('currenttile')}catch{}
            }else{
                win=true
            }
        }else{
            if (index>0){
                tiles[index-1].parentNode.parentNode.Anim()
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
window.customElements.define("game-key",Key)
window.customElements.define("game-keyboard",Keyboard)


