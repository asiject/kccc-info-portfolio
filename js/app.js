/**
 * CCC 홍보 페이지 메인 스크립트
 * - 슬라이드별 lazy load
 * - 내부 캐러셀(Swiper) 초기화
 * - 360° 파노라마 모달 / 서비스 중단 안내 모달
 */

// HTTPS 비디오 CDN (프로덕션 도메인)
const VIDEO_BASE_URL = 'https://cccvlm.com/cccvlm/video/introduce/'

let mainSwiper = null
let modalPanoramaViewer = null
let currentSlideIndex = -1

const query = (selector, root = document) => root.querySelector(selector)
const queryAll = (selector, root = document) => [...root.querySelectorAll(selector)]

/** 내부 캐러셀 slidesPerView 2 고정 */
const enforceCarouselSlidesPerView = (swiper) => {
  swiper.params.slidesPerView = 2
  swiper.params.slidesPerGroup = 2
  swiper.params.spaceBetween = 0
  swiper.update(true)
}

/** 내부 캐러셀 레이아웃 재계산 (숨겨진 상태에서 초기화된 경우 보정) */
const updateCarouselLayouts = (root = document) => {
  queryAll('[data-carousel]', root).forEach((container) => {
    if (container.swiper) {
      enforceCarouselSlidesPerView(container.swiper)
    }
  })
}

/** 슬라이드 내 data-src 이미지 로드 */
const loadImagesIn = (root) => {
  let pendingImages = 0

  const handleImageSettled = () => {
    pendingImages -= 1
    if (pendingImages <= 0) {
      updateCarouselLayouts(root)
    }
  }

  queryAll('img[data-src]', root).forEach((img) => {
    if (img.dataset.loaded) return

    pendingImages += 1
    img.addEventListener('load', handleImageSettled, { once: true })
    img.addEventListener('error', handleImageSettled, { once: true })
    img.src = img.dataset.src
    img.dataset.loaded = 'true'

    if (img.complete) {
      handleImageSettled()
    }
  })

  queryAll('source[data-srcset]', root).forEach((source) => {
    if (source.dataset.loaded) return
    source.srcset = source.dataset.srcset
    source.dataset.loaded = 'true'
  })

  if (pendingImages === 0) {
    updateCarouselLayouts(root)
  }
}

/** 슬라이드 내 비디오 지연 로드 */
const loadVideosIn = (root) => {
  queryAll('video[data-video-src]', root).forEach((video) => {
    if (video.dataset.loaded) return

    const source = document.createElement('source')
    source.src = VIDEO_BASE_URL + video.dataset.videoSrc
    source.type = 'video/mp4'
    video.appendChild(source)

    if (video.dataset.poster) {
      video.poster = video.dataset.poster
    }

    video.dataset.loaded = 'true'
  })
}

/** 내부 캐러셀 화살표 클릭이 메인 페이지 슬라이드로 전파되지 않도록 차단 */
const bindCarouselArrowEvents = (container) => {
  queryAll('.inner-swiper-prev, .inner-swiper-next', container).forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation()
    })
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.stopPropagation()
      }
    })
  })
}

/** 내부 이미지 캐러셀 초기화 */
const initCarousel = (container) => {
  bindCarouselArrowEvents(container)

  if (container.swiper) {
    enforceCarouselSlidesPerView(container.swiper)
    return
  }

  const prevButton = container.querySelector('.inner-swiper-prev')
  const nextButton = container.querySelector('.inner-swiper-next')

  // 화살표 요소 없으면 초기화 중단
  if (!prevButton || !nextButton) return

  const slideCount = container.querySelectorAll('.swiper-slide').length

  const carousel = new Swiper(container, {
    nested: true,
    loop: true,
    loopedSlides: slideCount,
    slidesPerView: 2,
    slidesPerGroup: 2,
    spaceBetween: 0,
    speed: 200,
    observer: true,
    observeParents: true,
    preventClicksPropagation: true,
    prevButton,
    nextButton,
    onImagesReady(swiper) {
      enforceCarouselSlidesPerView(swiper)
    },
  })

  requestAnimationFrame(() => enforceCarouselSlidesPerView(carousel))
  setTimeout(() => enforceCarouselSlidesPerView(carousel), 150)
}

/** 모달 열기 */
const openModal = ({ title, bodyHtml }) => {
  const modal = query('#app-modal')
  const modalTitle = query('#app-modal-title')
  const modalBody = query('.app-modal__body')

  if (!modal || !modalTitle || !modalBody) return

  if (modal.classList.contains('is-open')) {
    closeModal()
  }

  modalTitle.textContent = title
  modalBody.innerHTML = bodyHtml
  modal.classList.add('is-open')
  modal.setAttribute('aria-hidden', 'false')
  document.body.style.overflow = 'hidden'
  query('.app-modal__close')?.focus()
}

/** 모달 닫기 */
const closeModal = () => {
  const modal = query('#app-modal')
  const modalBody = query('.app-modal__body')

  if (modalPanoramaViewer) {
    modalPanoramaViewer.destroy()
    modalPanoramaViewer = null
  }

  if (modalBody) {
    modalBody.innerHTML = ''
  }

  if (modal) {
    modal.classList.remove('is-open', 'app-modal--panorama')
    modal.setAttribute('aria-hidden', 'true')
  }

  document.body.style.overflow = ''
}

/** 360° 파노라마 모달 */
const openPanoramaModal = (panoramaSrc) => {
  if (!panoramaSrc || typeof pannellum === 'undefined') return

  openModal({
    title: '여름수련회 360°',
    bodyHtml: '<div id="panorama-viewer" class="panorama-viewer"></div>',
  })

  query('#app-modal')?.classList.add('app-modal--panorama')

  requestAnimationFrame(() => {
    modalPanoramaViewer = pannellum.viewer('panorama-viewer', {
      type: 'equirectangular',
      panorama: panoramaSrc,
      autoLoad: true,
      autoRotate: -10,
      autoRotateInactivityDelay: 5,
      showZoomCtrl: true,
    })
  })
}

/** 중단된 서비스 안내 모달 */
const openServiceStoppedModal = () => {
  openModal({
    title: '아는 사람에게 CCC 소개하기',
    bodyHtml: '<p class="app-modal__message">지금은 중단된 서비스입니다.</p>',
  })
}

/** 360° 트리거 바인딩 */
const bindPanoramaTriggers = (root) => {
  queryAll('.panorama-trigger', root).forEach((trigger) => {
    if (trigger.dataset.bound) return
    trigger.dataset.bound = 'true'

    const handleOpen = (event) => {
      event.preventDefault()
      event.stopPropagation()
      const panoramaSrc = trigger.dataset.panoramaSrc || 'img/360.webp'
      openPanoramaModal(panoramaSrc)
    }

    trigger.addEventListener('click', handleOpen)
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        handleOpen(event)
      }
    })
  })
}

/** 모달 이벤트 초기화 */
const initModals = () => {
  queryAll('[data-modal-close]').forEach((closeTarget) => {
    closeTarget.addEventListener('click', closeModal)
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && query('#app-modal')?.classList.contains('is-open')) {
      closeModal()
    }
  })

  query('#missionhub-link')?.addEventListener('click', (event) => {
    event.preventDefault()
    openServiceStoppedModal()
  })
}

/** 슬라이드 ID 목록 (loop 모드에서 realIndex 기준) */
const SLIDE_IDS = [
  'slide-home',
  'slide-about',
  'slide-friends',
  'slide-growth',
  'slide-festival',
  'slide-mission',
  'slide-seniors',
  'slide-contact',
]

/** 메인 Swiper loop 모드에서 올바른 슬라이드로 이동 */
const navigateToSlide = (realIndex) => {
  if (!mainSwiper || realIndex < 0 || realIndex >= SLIDE_IDS.length) return

  if (mainSwiper.params.loop) {
    mainSwiper.slideTo(realIndex + mainSwiper.loopedSlides, 200)
    return
  }

  mainSwiper.slideTo(realIndex, 200)
}

/** 현재 보이는 페이지 슬라이드 요소 (loop 클론 포함) */
const getActivePageSlide = (realIndex) => {
  if (mainSwiper?.slides?.[mainSwiper.activeIndex]) {
    return mainSwiper.slides[mainSwiper.activeIndex]
  }
  return document.getElementById(SLIDE_IDS[realIndex])
}

/** 슬라이드 활성화 시 리소스 로드 */
const activateSlide = (realIndex) => {
  if (realIndex === currentSlideIndex) return
  currentSlideIndex = realIndex

  const slide = getActivePageSlide(realIndex)
  if (!slide) return

  loadImagesIn(slide)
  loadVideosIn(slide)
  bindPanoramaTriggers(slide)

  queryAll('[data-carousel]', slide).forEach(initCarousel)

  requestAnimationFrame(() => updateCarouselLayouts(slide))
  setTimeout(() => updateCarouselLayouts(slide), 150)
}

/** 메뉴 열기/닫기 */
const initMenu = () => {
  query('#menu')?.addEventListener('click', () => {
    document.documentElement.classList.add('active')
  })

  query('#close-menu')?.addEventListener('click', () => {
    document.documentElement.classList.remove('active')
  })

  queryAll('.box ul li a').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      document.documentElement.classList.remove('active')
      const slideId = event.currentTarget.getAttribute('href')?.slice(1)
      const slideIndex = SLIDE_IDS.indexOf(slideId)
      if (slideIndex >= 0) {
        navigateToSlide(slideIndex)
      }
    })
  })
}

/** Google Analytics 지연 로드 */
const initAnalytics = () => {
  window.dataLayer = window.dataLayer || []
  const gtag = (...args) => { window.dataLayer.push(args) }
  window.gtag = gtag
  gtag('js', new Date())
  gtag('config', 'G-EZHF8GVYT5')

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-EZHF8GVYT5'
  document.head.appendChild(script)
}

/** 메인 Swiper 초기화 */
const initMainSwiper = () => {
  mainSwiper = new Swiper('#app', {
    nextButton: '#right',
    prevButton: '#left',
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    onInit(swiper) {
      activateSlide(swiper.realIndex)
    },
    onSlideChangeStart(swiper) {
      activateSlide(swiper.realIndex)
    },
  })
}

/** 앱 초기화 */
const initApp = () => {
  initMenu()
  initModals()
  initMainSwiper()
  window.addEventListener('resize', () => {
    updateCarouselLayouts()
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}

window.addEventListener('load', initAnalytics)
