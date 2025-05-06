const { nanoid } = require("nanoid");
const books = require("./books");

const addBookHandler = (request, h) => {
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
    
    // Validasi name harus ada
    if (!name || name.trim() === '') {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });
        response.code(400);
        return response;
    }

    // validasi readPage tidak boleh lebih besar dari pageCount
    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);
        return response;
    }


    const finished = pageCount === readPage;
    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newBooks = {
        id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt,
    }

    books.push(newBooks);
    console.log(newBooks);
    const isSuccess = books.filter((book) => book.id === id).length > 0;
    
    if (isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            } ,
        });
        response.code(201);
        return response;
    }

    const response = h.response({
        status: 'error',
        message: 'Buku gagal ditambahkan',
    });
    response.code(500);
    return response;
};

const getAllBookHandler = (request,h) => {
    const { name, reading, finished } = request.query;

    let filteredBooks = books;

    // filter berdasarkan name (non-case sensitive)
    if (name) {
        filteredBooks = filteredBooks.filter((book) =>
            book.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    // filter berdasarkan reading:0 false atau 1 true
    if (reading !== undefined) {
        const isReading = reading === '1';
        filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
    }

    // filter berdasarkan finished: 0 false atau 1 true
    if (finished !== undefined) {
        const isFinished = finished === '1';
        filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
    }

    const responseBooks = filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher
    }));

    return h.response({
        status: 'success',
        data: {
            books: responseBooks,
        }
    }).code(200);
}

const getBookByIdHandler = (request,h) => {
    // ambil id dari url
    const { id } = request.params;

    // cari buku berdasarkan id
    const book = books.find((book) => book.id === id);

    // jika buku tidak ditemukan
    if (!book) {
        return h.response({
            status: 'fail',
            message: 'Buku tidak ditemukan',
        }).code(404);
    }

    return h.response({
        status: 'success',
        data: {
            book,
        },
    })
};

const updateBookHandler = (request, h) => {
    // ambil id dari url
    const { id } = request.params;
    const { name, year, author, summary, publisher, pageCount, readPage, reading} = request.payload;

    // cari buku yang akan diupdate
    const bookIndex = books.findIndex((book) => book.id === id);

    // jika buku tidak ditemukan
    if (bookIndex === -1) {
        return h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Id tidak ditemukan'
        }).code(404);
    }

    if(!name || name.trim() === ''){
        const response =  h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku'
        });
        response.code(400);
        return response;
    }

    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);
        return response;
    }

    const finished = pageCount === readPage;
    const updatedAt = new Date().toISOString();

    // update data buku
    books[bookIndex] = {
        ...books[bookIndex],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        finished,
        updatedAt,
    };

    return h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
    })
}

const deleteBookHandler = (request,h) => {
    const { id } = request.params;

    const bookIndex = books.findIndex((book) => book.id === id);

    if (bookIndex === -1) {
        return h.response({
            status: 'fail',
            message: 'Buku gagal dihapus. Id tidak ditemukan'
        }).code(404);
    }
    books.splice(bookIndex,1);
    return h.response({
        status: 'success',
        message: 'Buku berhasil dihapus'
    });
}

module.exports = { addBookHandler, getAllBookHandler, getBookByIdHandler, updateBookHandler, deleteBookHandler };