const transformBooks = (books) => {
    return books.map(book => ({
      ...book,
      authors: Array.isArray(book.writer)
        ? book.writer.map(w => ({
            name: w.author ? w.author.name : 'Unknown', 
            role: w.role,
          }))
        : [],
    }));
  };
  
  module.exports = transformBooks;
  