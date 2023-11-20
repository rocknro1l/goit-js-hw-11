import Notiflix, { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { fetchData } from './js/fetchData';
import { last } from 'lodash';

const gallery = document.querySelector('.gallery');
const form = document.querySelector('.search-form');
const target = document.querySelector('.js-guard');

let query = '';
let currentPage = 1;
let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(onScroll, options);

async function onScroll(entries) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      currentPage += 1;
      const response = await fetchData(query, currentPage);
      checkForMoreData(response);
    }
  });
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  query = event.target.elements.searchQuery.value;
  removeItems();
  currentPage = 1;

  observer.unobserve(target);

  let inputFormValue = query.toLowerCase().trim();

  if (inputFormValue === '') {
    Notiflix.Notify.failure('Please write query');
    return;
  }
  await fetchData(query, currentPage).then(checkSearchData);
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
  if (total < 40) {
    observer.unobserve(target);
  }
}

function checkForMoreData(search) {
  const lastPage = Math.round(search.totalHits / 40);
  markupContent(search);
  galleryLightbox.refresh();
  if (currentPage === lastPage) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    observer.unobserve(target);
  }
}
