import ImgApiService from './api-service';
import imagesTpl from '../templates/gallery.hbs';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/desktop/dist/PNotifyDesktop';
import '@pnotify/core/dist/BrightTheme.css';
import { error } from '@pnotify/core';
import * as basicLightbox from 'basiclightbox';

const refs = {
  searchForm: document.querySelector('.search-form'),
  input: document.querySelector('.input-field'),
  searchBtn: document.querySelector('.js-btn-src'),
  loadMoreBtn: document.querySelector('[data-action="load-more"]'),
  gallery: document.querySelector('.gallery'),
  labelLoadMoreBtn: document.querySelector('.label-load-more__btn'),
  observeListener: document.querySelector('.for-observe'),
  img: document.querySelector('.img-item'),
};
const imgApiService = new ImgApiService();
const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2,
  };
  const observer = new IntersectionObserver(onLoadMore, options);

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);
refs.input.addEventListener('input', clearInputField);
refs.gallery.addEventListener('click', onImgClick);

function clearInputField(e) {
  const inputField = e.target.value.trim();
  if (inputField === '') {
    refs.gallery.innerHTML = '';
    addHiddenClass();
    return;
  }
}

function onSearch(e) {
  e.preventDefault();

  refs.gallery.innerHTML = '';
  imgApiService.query = e.currentTarget.elements.query.value.trim();
  if (imgApiService.query === '') {
    return error({
      title: `Error!`,
      text: `Please, enter search parameters!`,
      styling: 'brighttheme',
      delay: 3000,
    });
  } else {
    removeHiddenClass();
    addSpinner();
    imgApiService.resetPage();
    imgApiService.fetchImages().then(hits => {
      appendImagesMarkup(hits);
      removeSpinner();
    });
  }
}

function onLoadMore() {
    observer.observe(refs.observeListener);
addSpinner();
  imgApiService.fetchImages().then(appendImagesMarkup).then(() => {
      removeSpinner()
      refs.loadMoreBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    });
}

function appendImagesMarkup(hits) {
  refs.gallery.insertAdjacentHTML('beforeend', imagesTpl(hits));
}

function addHiddenClass() {
  refs.loadMoreBtn.classList.add('is-hidden');
}

function removeHiddenClass() {
  refs.loadMoreBtn.classList.remove('is-hidden');
}

function addSpinner() {
  refs.labelLoadMoreBtn.textContent = 'Loading';
  refs.loadMoreBtn.setAttribute('disabled', true);
  refs.loadMoreBtn.classList.add('spin');
}

function removeSpinner() {
  refs.labelLoadMoreBtn.textContent = 'Load more';
  refs.loadMoreBtn.removeAttribute('disabled');
  refs.loadMoreBtn.classList.remove('spin');
}

function onImgClick(e) {
        if (e.target.nodeName !== 'IMG') {
          return;
        }       
        const instance = basicLightbox.create(`<img src="${e.target.dataset.source}" width="800" height="600">`);
        instance.show();
}