import Notiflix, { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { fetchData } from './js/fetchData';

const gallery = document.querySelector('.gallery');
const form = document.querySelector('.search-form');
const target = document.querySelector('.js-guard');

let currentPage = 1;
let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(onScroll, options);

function onScroll(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentPage += 1;
      fetchData(query, currentPage)
        .then(checkForMoreData)
        .catch(err => console.log(err));
    }
  });
}

form.addEventListener('submit', event => {
  query = event.target.elements.searchQuery.value;
  event.preventDefault();
  removeItems();
  currentPage = 1;
  observer.unobserve(target);
  let inputFormValue = query.toLowerCase().trim();

  if (inputFormValue === '') {
    return;
  }
  fetchData(query, currentPage)
    .then(checkSearchData)
    .catch(err => console.log(err));
});

let galleryLightbox = new SimpleLightbox('.photo-card a', {
  captionsData: 'alt',
  captionDelay: 250,
  captionPosition: 'bottom',
});

function markupContent(data) {
  const markup = data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
        <a class="gallery__item" href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes ${likes}</b>
          </p>
          <p class="info-item">
            <b>Views ${views}</b>
          </p>
          <p class="info-item">
            <b>Comments ${comments}</b>
          </p>
          <p class="info-item">
            <b>Downloads ${downloads}</b>
          </p>
        </div>
      </div>`;
      }
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

function removeItems() {
  gallery.innerHTML = '';
}

function checkSearchData(search) {
  const total = search.total;
  if (total > 0) {
    Notiflix.Notify.success(`We have the ${total} pictures fo you!`);
    markupContent(search);
    galleryLightbox.refresh();
    observer.observe(target);
  }

  if (total === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    removeItems();
  }
}

function checkForMoreData(search) {
  markupContent(search);
  galleryLightbox.refresh();
  if (search.hits.length === 40) {
    return;
  }
  if (search.hits.length < 40 && search.hits.length !== 0) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    observer.unobserve(target);
  }
}

console.log('1');
