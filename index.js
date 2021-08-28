const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const viewModeSwitcher = document.querySelector('#view-mode-switcher')

let currentViewMode = 'gallery-view'
let currentPage = 1

// Get and show movie data
axios.get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderByGalleryView(getMoviesByPage(currentPage))
  })
  .catch(error => {
    console.log(error)
  })

function renderMovieList(data) {
  if (currentViewMode === 'gallery-view') {
    renderByGalleryView(data)
  } else if (currentViewMode === 'list-view') {
    renderByListView(data)
  }
}

function renderByGalleryView(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}"><i class="far fa-thumbs-up"></i></button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function renderByListView(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
      <div class="col-12 d-flex justify-content-between mb-2">
        <h5>${item.title}</h5>
        <div class="function-btn">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite ml-2" data-id="${item.id}"><i class="far fa-thumbs-up"></i></button>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      console.log(data)
      modalTitle.innerText = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
      modalDate.innerText = 'release date: ' + data.release_date
      modalDescription.innerText = data.description
    })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  if (list.some(movie => movie.id === id)) {
    return alert('This movie has been added to favorite list!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function renderPaginator(amount) {
  // 80 / 12 = 6 ... 8 -> 7
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }

  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  } else if (event.target.matches('.fa-thumbs-up')) {
    addToFavorite(Number(event.target.parentElement.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`Cannot find movies with keyword: ${keyword}`)
  }

  renderPaginator(filteredMovies.length)
  renderByGalleryView(getMoviesByPage(1))
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  currentPage = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(currentPage))
})

viewModeSwitcher.addEventListener('click', function onViewModeSwitcherClicked(event) {
  if (event.target.matches('#gallery-view') && (currentViewMode !== 'gallery-view')) {
    currentViewMode = 'gallery-view'
    renderByGalleryView(getMoviesByPage(currentPage))
  } else if (event.target.matches('#list-view') && (currentViewMode !== 'list-view')) {
    console.log(event.target)
    currentViewMode = 'list-view'
    renderByListView(getMoviesByPage(currentPage))
  }
})