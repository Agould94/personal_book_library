const emptyStar = "☆"
const fullStar = "★"

function search(title) {
    var query = title
    const url = (`https://www.googleapis.com/books/v1/volumes?`)
    const params = new URLSearchParams({q: query})
    function requestapi(){
        fetch(url+params.toString())
        .then(function(response){
        return response.json()
    })
        .then(function(data){
            console.log(data.items)
            data.items.forEach(item=>{
                const image = item.volumeInfo.imageLinks.thumbnail
                const title = item.volumeInfo.title
                let stars = 0
                if(item.volumeInfo.subtitle==undefined){
                    var subtitle = null
                }
                else{
                    var subtitle = item.volumeInfo.subtitle
                }
                const pageCount = item.volumeInfo.pageCount
                const pageCountInt = parseInt(item.volumeInfo.pageCount)
                const bookObj = {
                    image: image,
                    title: title,
                    subtitle: subtitle,
                    pageCount:pageCount,
                    stars: stars
                }
                createSearchDiv(bookObj)
            })
        }
        )
    }
    requestapi()
}

function createSearchDiv(bookObj){
    const searchDiv = document.getElementById('search-div')
    const card = createCard(bookObj, true)
    searchDiv.appendChild(card)
}

function createLibraryDiv(bookObj){
    const libraryDiv = document.getElementById('library-div')
    const card = createCard(bookObj, false)
    libraryDiv.appendChild(card)
}

function createStars(bookObj){
    const bookStars = document.createElement('div')
    bookStars.className = "book-stars"
    for(var i = 0; i<5; i++){
        const bookStar = document.createElement("span")
        bookStar.className = "star-glyph"
        bookStar.id = `${i+1}`
        if(i < bookObj.stars){
            bookStar.innerHTML = fullStar
            bookStar.className = "activated-star"
        }
        else{bookStar.innerHTML=('☆')}
        bookStars.appendChild(bookStar)
        bookStar.addEventListener("click",(e)=>{
            const starId = e.target.id
            console.log(bookObj)
            starRating(e)
            if(e.target.className == "activated-star"){
                bookObj.stars = starId
                updateLibraryBook(bookObj)
            }else{
                bookObj.stars = 0
                updateLibraryBook(bookObj)
            }
            }
        )
    }

    return bookStars
}

function starRating(e){
    const star = e.target;
    const previousStars = getPreviousSiblings(star)
        const nextStars = getNextSiblings(star)
        console.log(nextStars)
    if(star.innerText === emptyStar){
        previousStars.unshift(star)
        previousStars.forEach(s => {
            s.innerText=fullStar
            s.className="activated-star"
        })
    } else {
        nextStars.unshift(star)
        nextStars.forEach(s=>{
            s.innerText = emptyStar
            s.className = "star-glyph"
        })
    }
}

function getPreviousSiblings(element){
    var siblings = []
    while(element = element.previousElementSibling){
        siblings.push(element);
    }
    return siblings
}

function getNextSiblings(element){
    var siblings = []
    while(element = element.nextElementSibling){
        siblings.push(element)
    }
    return siblings
}

function createCard(bookObj, t){
    const bookStars = createStars(bookObj)
    const bookCardDiv = document.createElement('div')
    bookCardDiv.className = "bookCard"
    const image = document.createElement("img")
    image.src = bookObj.image
    const container = document.createElement('div')
    container.className = "container"
    const title = document.createElement('h4')
    const subtitle = document.createElement('p')
    title.innerText = bookObj.title
    subtitle.innerText = bookObj.subtitle
    const pageCount = document.createElement('p')
    pageCount.innerText=`${bookObj.pageCount} pages`
    container.appendChild(title)
    container.appendChild(subtitle)
    container.appendChild(pageCount)
    container.appendChild(bookStars)
    const addToLibraryButton = document.createElement("button")
    addToLibraryButton.addEventListener('click', ()=>{addBookToLibrary(bookObj)})
    addToLibraryButton.innerText = "Add To Library"
    if(t==true){
        container.appendChild(addToLibraryButton)
    }
    bookCardDiv.appendChild(image)
    bookCardDiv.appendChild(container)
    
   return bookCardDiv
}

function createSearch(){
    const bookForm = document.querySelector("form");
    console.log(bookForm)
    bookForm.addEventListener("submit", handleSubmit)
    function handleSubmit(e){
        e.preventDefault()
        search(e.target.title.value)
    }
}

function addBookToLibrary(bookObj){
    fetch("http://localhost:3000/Library",{
        method: 'POST',
        headers:{
            'Content-type':'application/json'
        },
        body:JSON.stringify(bookObj)
    })
    .then(res=>res.json())
    .then(book=>createLibraryDiv(book)) 
}

function updateLibraryBook(bookObj){
    fetch(`http://localhost:3000/Library/${bookObj.id}`,{
        method: 'PATCH',
        headers:{
            'Content-type':'application/json'
        },
        body:JSON.stringify(bookObj)
    })
    .then(res => res.json())
    .then(book => console.log(book))
}

function displayLibrary(){
    fetch("http://localhost:3000/Library")
    .then(res=>res.json())
    .then(function(data){
        const totalPages = data.map(item=>{return item.pageCount}).reduce(function(a, b){return a+b})
        const libraryDiv = document.getElementById("library-div")
        const pageText = document.createElement("p")
        pageText.id = "pages-read"
        pageText.innerText= `You have read ${totalPages} pages`
        libraryDiv.appendChild(pageText)
        data.forEach(item=>{
            createLibraryDiv(item)
        })
        
    })
}

document.addEventListener('DOMContentLoaded', function(){
    createSearch()
    displayLibrary()
})