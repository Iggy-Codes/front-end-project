/* eslint no-undef: "off" */
(function () {
  angular
    .module('bookStoreApp')
    .factory('BookStoreFactory', [
      '$http',
      'cfg',
      BookStoreFactory
    ])

  function BookStoreFactory ($http, cfg) {
    function getHomeData () { // eslint-disable-line no-unused-vars
      var url = cfg.urlHome.replace('<%API-KEY%>', cfg.apiKey)
      return $http.get(url)
        .then(getOverviewBooks)
        .then(getBooksForHome)
    }

    function getCategoryBooks (categoryURL) {
      var url = cfg.urlCategory.replace('<%CATEGORY-NAME%>', categoryURL).replace('<%API-KEY%>', cfg.apiKey)
      return $http.get(url)
        .then(getCategoryResults)
    }

    function getCategoryName (urlListName) {
      var url = cfg.urlHome.replace('<%API-KEY%>', cfg.apiKey)
      return $http.get(url)
        .then(getListDetails)
        .then(getListName)
    }

    function getBooksByAuthor (authorName) {
      authorName = encodeURI(authorName)
      url = cfg.urlAuthor.replace('<%AUTHOR%>', authorName).replace('<%API-KEY%>', cfg.apiKey)
      return $http.get(url)
      .then(getBooksNotEmpty)
    }

    return {
      getHomeData: getHomeData,
      getCategoryBooks: getCategoryBooks,
      getCategoryName: getCategoryName,
      getBooksByAuthor: getBooksByAuthor
    }

    function getOverviewBooks (response) {
      var aBooks = []
      response.data.results.lists.forEach(function (category) {
        var categoryDisplay = category.display_name
        var categoryEncoded = category.list_name_encoded
        category.books.forEach(function (book) {
          aBooks.push({
            author: book.author,
            author_url: encodeURI(book.author),
            category: categoryDisplay,
            category_url: categoryEncoded,
            description: book.description,
            img: book.book_image,
            isbn: book.primary_isbn13,
            publisher: book.publisher,
            title: book.title,
            weeksOnList: book.weeks_on_list
          })
        })
      })
      return aBooks
    }

    function getBooksForHome (arrayBooks) {
      var booksHome = []
      var booksHomeLengthMax = (cfg.booksInHome < arrayBooks.length) ? cfg.booksInHome : arrayBooks.length
      while (booksHome.length < booksHomeLengthMax) {
        var aleatory = getRandomIntInclusive(0, arrayBooks.length - 1)
        // Check that the titles are diferent
        var isInArray = false
        booksHome.forEach(function (book) {
          if (book.title === arrayBooks[aleatory].title) isInArray = true
        })
        if (!isInArray) {
          booksHome.push(arrayBooks[aleatory])
        }
      }
      return booksHome
    }

    function getCategoryResults (response) {
      return response.data.results.books.map(function (book) {
        return {
          author: book.author,
          author_url: encodeURI(book.author),
          description: book.description,
          img: book.book_image,
          isbn: book.primary_isbn13,
          publisher: book.publisher,
          rank: book.rank,
          title: book.title
        }
      })
    }

    function getListDetails (response) {
      return response.data.results.lists.map(function (element) {
        return {
          list_name_encoded: element.list_name_encoded,
          display_name: element.display_name
        }
      })
    }

    function getListName (arrayList) {
      return arrayList.filter(function (element) {
        if (element.list_name_encoded === urlListName) return element
      })
    }

    function getBooksNotEmpty (response) {
      var aBooks = response.data.results
      // new array without elements that not have isbns
      var aBooksFiltered = aBooks.filter(function (book) {
        var bcontrol = true
        if (book.isbns.length === 0) {
          bcontrol = false
        } else if (book.isbns[book.isbns.length - 1].isbn13 === '') {
          bcontrol = false
        } else if (book.description === '' && book.publisher === '') {
          bcontrol = false
        }
        return bcontrol
      })
      // created a new array with elements to pass
      return aBooksFiltered.map(function (bookAuthor) {
        // get the last isbn13 in the array isbns because is near of actually date
        var elemIsbn13 = bookAuthor.isbns[bookAuthor.isbns.length - 1].isbn13
        var category = bookAuthor.ranks_history.length ? bookAuthor.ranks_history[bookAuthor.ranks_history.length - 1].display_name : ''
        return {
          isbn: elemIsbn13,
          description: bookAuthor.description,
          title: bookAuthor.title,
          author: bookAuthor.author,
          img: cfg.urlImageBook.replace('<%ISBN13%>', elemIsbn13),
          category: category,
          publisher: bookAuthor.publisher
        }
      })
    }

    function getRandomIntInclusive (min, max) {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
  }
})()
