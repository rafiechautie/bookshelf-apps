//buat array untu
const books = [];

const RENDER_EVENT = 'render-books';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

document,addEventListener('DOMContentLoaded', function(){
    const submitForm = document.getElementById('form-add')
    const searchForm = document.getElementById('search-form')
    const inputSearch = document.getElementById('input-search');
    const resultSearch = document.getElementById('uncompleted-search-results') 
    // console.log(submitForm);
    submitForm.addEventListener('submit', function(e){
        //untuk membantalkan behaviour submit
        e.preventDefault();
        // console.log('test');
        addBook();
    });

    searchForm.addEventListener('submit', function(e){
        e.preventDefault();
        const searchTerm = inputSearch.value.toLowerCase(); 
        const searchResult =searchBooksByTitle(searchTerm);
        displaySearchResults(searchResult);
    })

    if(isStorageExist()){
        loadDataFromStorage();
    }
})

document.addEventListener(RENDER_EVENT, function (){
    // console.log(books);
    const uncompletedBooks = document.getElementById('uncompleted-books');
    uncompletedBooks.innerHTML = '';

    const completedBooks = document.getElementById('completed-books');
    completedBooks.innerHTML = '';
    updateBookCounts()

    for(const bookItem of books){
        const bookElement = makeBook(bookItem);
        if(!bookItem.isComplete){
            //tarok ke barisan yang belom selesai dibaca
            uncompletedBooks.append(bookElement)
        }else{
            //tarok ke barisan yang sudah selesai dibaca
            completedBooks.append(bookElement);
        }
    }
})

function searchBooksByTitle(title) {
    return books.filter(book => book.title.toLowerCase().includes(title));
}

function displaySearchResults(results) {
    const uncompletedResultsContainer = document.getElementById('uncompleted-books');
    const completedResultsContainer = document.getElementById('completed-books');

    uncompletedResultsContainer.innerHTML = ''; // Clear previous content
    completedResultsContainer.innerHTML = ''; // Clear previous content

    if (results.length === 0) {
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = 'No results found.';
        uncompletedResultsContainer.appendChild(noResultsMessage);
        completedResultsContainer.appendChild(noResultsMessage);
        return;
    }

    // console.log(results);

    // for(const bookItem of books){
    //     const bookElement = makeBook(bookItem);
    //     if(!bookItem.isComplete){
    //         //tarok ke barisan yang belom selesai dibaca
    //         uncompletedBooks.append(bookElement)
    //     }else{
    //         //tarok ke barisan yang sudah selesai dibaca
    //         completedBooks.append(bookElement);
    //     }
    // }

    for(const resultItem of results){
        const bookElement = makeBook(resultItem);
        if(!resultItem.isComplete){
            //tarok ke barisan yang belom selesai dibaca
            uncompletedResultsContainer.append(bookElement)
        }else{
            //tarok ke barisan yang sudah selesai dibaca
            completedResultsContainer.append(bookElement);
        }
    }

    // results.forEach(book => {
    //     // const bookTitle = document.createElement('p');
    //     // bookTitle.textContent = book.title;
    //     makeBook(book)
    //     if (!book.isComplete) {
    //         uncompletedResultsContainer.appendChild(book.title);
    //     } else {
    //         completedResultsContainer.appendChild(book.title);
    //     }
    // });
}




//cek apakah fitur web storage didukung oleh browser
function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
      alert('Browser kamu tidak mendukung local storage');
      return false;
    }
    return true;
}

//menjalankan fungsi tambah buku ke local storage
function addBook(){
    //tangkap value yang diinput oleh user di form
    const inputBookTitle = document.getElementById('book-title').value;
    const inputBookAuthor = document.getElementById('book-author').value;
    const inputReleaseYear = document.getElementById('release-year').value;
    const inputIsComplete = document.getElementById('isComplete').checked;

    // console.log(inputBookTitle);
    // console.log(inputBookAuthor);
    // console.log(inputReleaseYear);
    console.log(inputIsComplete);

    //buat id
    const generateID = generateId();
    //buat object untuk menyimpan data todo
    const bookObject = generateBookObject(generateID, inputBookTitle, inputBookAuthor, inputReleaseYear, inputIsComplete)
    //data yang dinput oleh user disimpan ke objet
    books.push(bookObject);

    // console.log(books);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveToLocalStorage();
}


//fungsi untuk menampilkan book yang completed dengan yang tidak di html
function makeBook(bookObject){
    //buat element html h2 untuk bookTitle
    const bookTitle = document.createElement('h4');
    bookTitle.classList.add('text-book')
    //ambil data book dari object bookObject
    bookTitle.innerText = bookObject.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.classList.add('text-book')
    bookAuthor.innerText = bookObject.author;

    const  bookRelease = document.createElement('p');
    bookRelease.classList.add('text-book')
    bookRelease.innerText = bookObject.year;

    //buat button
    const undoButton = document.createElement('button');
    undoButton.classList.add('green');

    const deleteButton = document.createElement('button');
    deleteButton.innerText = "Hapus Buku"
    deleteButton.classList.add('red')

    const containerButton = document.createElement('div');
    containerButton.classList.add('action');
    //masukkan button delete ke button undo ke sebuah container
    containerButton.append(undoButton, deleteButton);

    const article = document.createElement('article');
    article.classList.add('book_item')
    article.append(bookTitle, bookAuthor, bookRelease, containerButton);

    //handle button complete dan delete button
    if(bookObject.isComplete){
        //kasih teks ke button
        undoButton.innerText = "Belum Selesai Dibaca"
        undoButton.addEventListener('click', function (){
            undoBookFromCompleted(bookObject.id);
            updateBookCounts()
        })

        
    }else{
        //kasih teks ke button
        undoButton.innerText = "Selesai Dibaca"
        undoButton.addEventListener('click', function (){
            undoBookFromUnCompleted(bookObject.id);
            updateBookCounts()
        })
    }

    deleteButton.addEventListener('click', function(){
        removeBookFromCompleted(bookObject.id);
    })


    return article;
}

function updateBookCounts() {
    const uncompletedCountElement = document.getElementById('uncompleted-count');
    const completedCountElement = document.getElementById('completed-count');

    const uncompletedCount = books.filter(book => !book.isComplete).length;
    const completedCount = books.filter(book => book.isComplete).length;

    uncompletedCountElement.textContent = uncompletedCount;
    completedCountElement.textContent = completedCount;
}

function removeBookFromCompleted(bookId){
    const bookTarget = findBookIndex(bookId);

    if(bookTarget === -1 ) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveToLocalStorage();
}

function undoBookFromCompleted(bookId){
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveToLocalStorage();
}

function undoBookFromUnCompleted(bookId){
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveToLocalStorage();
}

function addCompletedBook(bookId){
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveToLocalStorage();
}

//fungsi untuk mencari buku berdasarkan id
function findBook(bookId){
    for (const bookItem of books){
        //jika id buku yang dicari sama dengan yang ada di data bookId
        if(bookItem.id === bookId){
            return bookItem;
        }
    }
}

//mencari book untuk mengembalikan sesuai dengan indeksnya
function findBookIndex(bookId){
    for(const index in books){
        if(books[index].id === bookId){
            return index;
        }
    }

    return -1;
}

function saveToLocalStorage(){
    if(isStorageExist()){
        //konversi ke tipe data teks karena local storace hanya menerima data tersebut
        const parsed = JSON.stringify(books);
        //menyimpan data ke storage sesuai dengan key
        localStorage.setItem(STORAGE_KEY, parsed);
        //SAVED_EVENT digunakan untuk tracking perubahan data
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data != null){
        for(const book of data){
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

//fungsi untuk menghasilkan id yang unik
function generateId() {
    return +new Date();
}


//fungsi untuk membuat object yang akan digunakan untuk disimpan di local storage
function generateBookObject(id, title, author,  year, isComplete){
    return{
        id,
        title,
        author,
        year,
        isComplete
    }
}