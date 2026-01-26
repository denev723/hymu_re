$(document).ready(function () {
  const $depth2Lists = $(".lnb-list--depth-2");
  const $headerBg = $(".site-header__bg");
  const $lnbItems = $(".lnb-list > .lnb-list__item");
  const $siteHeader = $(".site-header");
  const $lnbList = $(".lnb-list");

  if (!$depth2Lists.length || !$headerBg.length) {
    return;
  }

  if ($lnbItems.length && $siteHeader.length) {
    const toggleHeaderState = () => {
      if ($lnbItems.filter(".active").length) {
        $siteHeader.addClass("lnb-over");
      } else {
        $siteHeader.removeClass("lnb-over");
      }
    };

    const isWithinMenu = (target, clientX) => {
      if (!target) {
        return false;
      }

      const $closestItem = $(target).closest(".lnb-list__item");

      if (!$closestItem.length) {
        return false;
      }

      const isInsideList = $closestItem.closest(".lnb-list").is($lnbItems.parent());

      if (!isInsideList) {
        return false;
      }

      if (typeof clientX !== "number") {
        return true;
      }

      const menuElement = $lnbList.get(0);

      if (!menuElement) {
        return true;
      }

      const { left, right } = menuElement.getBoundingClientRect();

      return clientX >= left && clientX <= right;
    };

    $lnbItems.on("mouseenter", function () {
      const $item = $(this);
      $lnbItems.not($item).removeClass("active");
      $item.addClass("active");
      $siteHeader.addClass("lnb-over");
    });

    $lnbItems.on("mouseleave", function (event) {
      const $item = $(this);
      $item.removeClass("active");

      if (!isWithinMenu(event.relatedTarget, event.clientX)) {
        toggleHeaderState();
      }
    });

    $lnbList.on("mouseleave", function (event) {
      if (!isWithinMenu(event.relatedTarget, event.clientX)) {
        $lnbItems.removeClass("active");
        toggleHeaderState();
      }
    });

    $lnbItems.on("focusin", function () {
      const $item = $(this);
      $lnbItems.not($item).removeClass("active");
      $item.addClass("active");
      $siteHeader.addClass("lnb-over");
    });

    $lnbItems.on("focusout", function (event) {
      const $item = $(this);
      $item.removeClass("active");

      if (!isWithinMenu(event.relatedTarget)) {
        toggleHeaderState();
      }
    });
  }

  const getListHeight = ($list) => {
    const isHidden = !$list.is(":visible");

    if (!isHidden) {
      return $list.outerHeight();
    }

    const originalStyles = {
      position: $list.css("position"),
      visibility: $list.css("visibility"),
      display: $list.css("display"),
    };

    $list.css({ position: "absolute", visibility: "hidden", display: "block" });
    const height = $list.outerHeight();
    $list.css(originalStyles);

    return height;
  };

  const updateBgHeight = () => {
    let maxHeight = 0;

    $depth2Lists.each(function () {
      const $list = $(this);
      const listHeight = getListHeight($list);

      if (listHeight > maxHeight) {
        maxHeight = listHeight;
      }
    });

    if (maxHeight > 0) {
      $headerBg.height(maxHeight);
    }
  };

  updateBgHeight();

  let resizeTimer = null;
  $(window).on("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateBgHeight, 150);
  });

  // Sitemap 토글
  const $sitemap = $(".sitemap");
  if ($sitemap.length) {
    const $body = $("body");
    const $sitemapInner = $sitemap.find(".sitemap__inner");
    const $sitemapOpenButtons = $(".btn-sitemap");
    const $sitemapCloseButtons = $(".btn-close--1");

    const lockBodyScroll = () => {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      const currentPaddingRight = parseInt($body.css("padding-right"), 10) || 0;

      if (scrollBarWidth > 0) {
        $body.data("original-padding-right", currentPaddingRight);
        $body.css("padding-right", currentPaddingRight + scrollBarWidth);
      }

      $body.addClass("is-sitemap-open");
    };

    const unlockBodyScroll = () => {
      const originalPaddingRight = $body.data("original-padding-right");

      if (typeof originalPaddingRight !== "undefined") {
        $body.css("padding-right", originalPaddingRight);
        $body.removeData("original-padding-right");
      } else {
        $body.css("padding-right", "");
      }

      $body.removeClass("is-sitemap-open");
    };

    const openSitemap = () => {
      $sitemap.addClass("active");
      lockBodyScroll();
    };

    const closeSitemap = () => {
      $sitemap.removeClass("active");
      unlockBodyScroll();
    };

    $sitemapOpenButtons.on("click", function (event) {
      event.preventDefault();
      openSitemap();
    });

    $sitemapCloseButtons.on("click", function () {
      closeSitemap();
    });

    $sitemap.on("click", function (event) {
      if (!$sitemapInner.is(event.target) && $sitemapInner.has(event.target).length === 0) {
        closeSitemap();
      }
    });
  }

  // Visual Swiper 초기화
  const $visualSwiperEl = $("#visualSwiper");
  if ($visualSwiperEl.length) {
    const $visualControls = $(".visual__controls");
    const $currentNum = $visualControls.find(".visual__num--current");
    const $totalNum = $visualControls.find(".visual__num--total");
    const $progressBar = $visualControls.find(".visual__progress-bar");
    const $toggleBtn = $visualControls.find(".btn-slide--toggle");
    const $prevBtn = $visualControls.find(".btn-slide--prev");
    const $nextBtn = $visualControls.find(".btn-slide--next");

    const visualSwiper = new Swiper("#visualSwiper", {
      loop: true,
      autoplay: {
        delay: 8000,
        disableOnInteraction: false,
      },
      speed: 800,
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      resizeObserver: false,
      watchOverflow: true,
      on: {
        init: function () {
          const totalSlides = this.slides.length;
          $totalNum.text(totalSlides);
          updateSlideInfo(this);
        },
        slideChange: function () {
          updateSlideInfo(this);
        },
        autoplayStart: function () {
          $toggleBtn.removeClass("paused").addClass("playing");
        },
        autoplayStop: function () {
          $toggleBtn.removeClass("playing").addClass("paused");
        },
      },
    });

    // resize 이벤트에 debounce 적용하여 Swiper 업데이트 제어
    let swiperResizeTimer = null;
    $(window).on("resize", function () {
      clearTimeout(swiperResizeTimer);
      swiperResizeTimer = setTimeout(function () {
        visualSwiper.update();
      }, 300);
    });

    // 슬라이드 정보 업데이트 함수
    function updateSlideInfo(swiper) {
      const realIndex = swiper.realIndex + 1;
      const totalSlides = swiper.slides.length;
      const progress = (realIndex / totalSlides) * 100;

      $currentNum.text(realIndex);
      $progressBar.css("width", progress + "%");
    }

    // 이전 버튼 클릭
    $prevBtn.on("click", function () {
      visualSwiper.slidePrev();
    });

    // 다음 버튼 클릭
    $nextBtn.on("click", function () {
      visualSwiper.slideNext();
    });

    // 재생/정지 토글 버튼 클릭
    $toggleBtn.on("click", function () {
      const $btn = $(this);
      if ($btn.hasClass("playing")) {
        visualSwiper.autoplay.stop();
        $btn.removeClass("playing").addClass("paused");
      } else {
        visualSwiper.autoplay.start();
        $btn.removeClass("paused").addClass("playing");
      }
    });
  }

  // News Swiper 초기화
  const $newsSwiperEl = $("#newsSwiper");
  if ($newsSwiperEl.length) {
    const $newsSection = $(".main-common--news");
    const $progressBar = $newsSection.find(".main-common__progress-bar");
    const $toggleBtn = $newsSection.find(".btn-slide--toggle");
    const $prevBtn = $newsSection.find(".btn-slide--prev");
    const $nextBtn = $newsSection.find(".btn-slide--next");

    const newsSwiper = new Swiper("#newsSwiper", {
      slidesPerView: "auto",
      slidesPerGroup: 1,
      loop: false,
      pagination: {
        el: ".main-common__progress",
        type: "progressbar",
      },
      on: {
        autoplayStart: function () {
          $toggleBtn.removeClass("paused").addClass("playing");
        },
        autoplayStop: function () {
          $toggleBtn.removeClass("playing").addClass("paused");
        },
      },
    });

    // 이전 버튼 클릭
    $prevBtn.on("click", function () {
      newsSwiper.slidePrev();
    });

    // 다음 버튼 클릭
    $nextBtn.on("click", function () {
      newsSwiper.slideNext();
    });

    // 재생/정지 토글 버튼 클릭
    $toggleBtn.on("click", function () {
      const $btn = $(this);
      if ($btn.hasClass("playing")) {
        newsSwiper.autoplay.stop();
        $btn.removeClass("playing").addClass("paused");
      } else {
        newsSwiper.autoplay.start();
        $btn.removeClass("paused").addClass("playing");
      }
    });

    // resize 이벤트에 debounce 적용하여 Swiper 업데이트 제어
    let newsSwiperResizeTimer = null;
    $(window).on("resize", function () {
      clearTimeout(newsSwiperResizeTimer);
      newsSwiperResizeTimer = setTimeout(function () {
        newsSwiper.update();
      }, 300);
    });
  }

  // Sub Notice Swiper 초기화
  const $subNoticeSwiperEl = $("#subNoticeSwiper");
  if ($subNoticeSwiperEl.length) {
    const subNoticeSwiper = new Swiper("#subNoticeSwiper", {
      direction: "vertical",
      loop: true,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
      },
      speed: 800,
      slidesPerView: 1,
      spaceBetween: 0,
    });
  }

  // SNB 메뉴 토글 기능
  const $snb = $(".snb");
  if ($snb.length) {
    const $snbMenus = $snb.find(".snb__menu");
    const $snbLinks = $snbMenus.find("> .snb__link");

    // 화면 너비 체크 함수
    const isMobile = () => {
      return window.innerWidth <= 768;
    };

    // 바깥 영역 클릭 시 active 클래스 제거
    const handleOutsideClick = (event) => {
      if (isMobile()) {
        const $target = $(event.target);
        if (!$target.closest(".snb__menu").length) {
          $snbMenus.removeClass("active");
        }
      }
    };

    // 데스크톱: 마우스 오버/아웃 이벤트
    const handleDesktopEvents = () => {
      $snbMenus.off("mouseenter mouseleave");
      $snbMenus.on("mouseenter", function () {
        if (!isMobile()) {
          const $menu = $(this);
          $snbMenus.not($menu).removeClass("active");
          $menu.addClass("active");
        }
      });

      $snbMenus.on("mouseleave", function () {
        if (!isMobile()) {
          $(this).removeClass("active");
        }
      });
    };

    // 모바일: 클릭 이벤트
    const handleMobileEvents = () => {
      $snbLinks.off("click");
      $snbLinks.on("click", function (event) {
        if (isMobile()) {
          event.preventDefault();
          const $menu = $(this).closest(".snb__menu");
          const isActive = $menu.hasClass("active");
          $snbMenus.removeClass("active");
          if (!isActive) {
            $menu.addClass("active");
          }
        }
      });

      // 바깥 영역 클릭 감지
      $(document).off("click.snb");
      $(document).on("click.snb", handleOutsideClick);
    };

    // 초기 이벤트 설정
    if (isMobile()) {
      handleMobileEvents();
    } else {
      handleDesktopEvents();
    }

    // SNB 스크롤 고정 기능
    let snbOriginalTop = null;
    let isSnbFixed = false;

    const initSnbScroll = () => {
      if ($snb.length && $snb.is(":visible")) {
        snbOriginalTop = $snb.offset().top;
      }
    };

    const handleSnbScroll = () => {
      if (!$snb.length || snbOriginalTop === null) {
        return;
      }

      const scrollTop = $(window).scrollTop();

      if (scrollTop > snbOriginalTop && !isSnbFixed) {
        // SNB를 fixed로 변경
        $snb.addClass("fixed");
        isSnbFixed = true;
      } else if (scrollTop <= snbOriginalTop && isSnbFixed) {
        // SNB를 원상태로 복구
        $snb.removeClass("fixed");
        isSnbFixed = false;
      }
    };

    // 초기 SNB 위치 설정
    initSnbScroll();

    // 스크롤 이벤트 등록
    $(window).on("scroll.snb", handleSnbScroll);

    // 리사이즈 시 이벤트 재설정
    let snbResizeTimer = null;
    $(window).on("resize", function () {
      clearTimeout(snbResizeTimer);
      snbResizeTimer = setTimeout(function () {
        // SNB 위치 재계산
        initSnbScroll();

        if (isMobile()) {
          $snbMenus.removeClass("active");
          handleMobileEvents();
        } else {
          $(document).off("click.snb");
          handleDesktopEvents();
        }
      }, 150);
    });
  }

  // Facility 아이템 마우스 오버 기능
  const $facilityItems = $(".facility__item");
  const $facilityImages = $(".img-wrap img");

  if ($facilityItems.length && $facilityImages.length) {
    $facilityItems.on("mouseenter", function () {
      const $item = $(this);
      const itemText = $item.text().trim();

      // 모든 이미지에서 active 클래스 제거
      $facilityImages.removeClass("active");

      // data-facility 값이 일치하는 이미지 찾기
      $facilityImages.each(function () {
        const $img = $(this);
        const facilityData = $img.attr("data-facility");

        if (facilityData && facilityData === itemText) {
          $img.addClass("active");
        }
      });

      // facility__item에도 active 클래스 추가
      $facilityItems.removeClass("active");
      $item.addClass("active");
    });
  }

  // Modal 인터랙션
  const $modal = $(".modal");
  const $modalInner = $modal.find(".modal__inner");
  const $modalContents = $modal.find(".modal-content, .modal-content--flex");
  const $modalOpenButtons = $("a.modal-open");
  const $modalCloseButtons = $(".modal__close");

  const openModal = (targetSelector) => {
    if (!$modal.length) {
      return;
    }

    $modal.addClass("active");
    $modalContents.removeClass("active");

    if (targetSelector) {
      const $targetContent = $modalContents.filter(`[data-item="${targetSelector}"]`);
      $targetContent.addClass("active");
    }
  };

  const closeModal = () => {
    if (!$modal.length) {
      return;
    }

    $modal.removeClass("active");
    $modalContents.removeClass("active");
  };

  if ($modalOpenButtons.length && $modal.length) {
    $modalOpenButtons.on("click", function (event) {
      event.preventDefault();
      const target = $(this).attr("href");
      openModal(target);
    });
  }

  if ($modalCloseButtons.length && $modal.length) {
    $modalCloseButtons.on("click", function (event) {
      event.preventDefault();
      closeModal();
    });
  }

  if ($modal.length) {
    $modal.on("click", function (event) {
      if (!$modalInner.is(event.target) && $modalInner.has(event.target).length === 0) {
        closeModal();
      }
    });
  }

  // Investigation history tab 연동
  const $contsTabLinks = $(".conts-tab__link");
  const $historyWraps = $(".history-wrap");

  if ($contsTabLinks.length && $historyWraps.length) {
    $contsTabLinks.on("click", function (event) {
      event.preventDefault();
      const $link = $(this);
      const target = $link.attr("href");

      $contsTabLinks.removeClass("active");
      $link.addClass("active");

      $historyWraps.removeClass("active");

      if (target) {
        $historyWraps.filter(`[data-list="${target}"]`).addClass("active");
      }
    });
  }

  // Investigation history image preview (desktop)
  const $historyButtons = $(".history-list .btn-view");
  const isDesktopViewport = () => window.innerWidth > 768;

  const hideImagePreview = ($wrap) => {
    const $imageWrap = $wrap.find(".conts__image");

    if ($imageWrap.length) {
      $imageWrap.removeClass("active");
      $imageWrap.css({ top: "", left: "" });
      $imageWrap.find("img").removeClass("active");
    }
  };

  if ($historyButtons.length) {
    const GAP = 12;

    $historyButtons.on("mouseenter", function () {
      if (!isDesktopViewport()) {
        return;
      }

      const $btn = $(this);
      const dataItem = $btn.data("item");
      const $wrap = $btn.closest(".history-wrap");
      const $imageWrap = $wrap.find(".conts__image");

      if (!$imageWrap.length) {
        return;
      }

      const buttonOffset = $btn.offset();
      const wrapOffset = $wrap.offset();
      const buttonHeight = $btn.outerHeight();

      const top = buttonOffset.top - wrapOffset.top + buttonHeight + GAP;
      const left = buttonOffset.left - wrapOffset.left;

      $imageWrap.css({ top, left }).addClass("active");

      const $images = $imageWrap.find("img");
      $images.removeClass("active");

      if (dataItem) {
        $images.filter(`[data-item="${dataItem}"]`).addClass("active");
      }
    });

    $historyButtons.on("mouseleave", function () {
      if (!isDesktopViewport()) {
        return;
      }

      hideImagePreview($(this).closest(".history-wrap"));
    });

    $(window).on("resize.historyPreview", function () {
      if (!isDesktopViewport()) {
        $(".conts__image").removeClass("active").css({ top: "", left: "" });
      }
    });
  }

  // 범용 탭 기능 (conts-tab__link)
  const $contsTabLinksGeneral = $(".conts-tab__link");
  const $contsBodyInner = $(".conts__body-inner");
  const $contsBottom = $(".conts__bottom");

  if ($contsTabLinksGeneral.length && ($contsBodyInner.length || $contsBottom.length)) {
    $contsTabLinksGeneral.on("click", function (event) {
      event.preventDefault();
      const $link = $(this);
      const target = $link.attr("href"); // #tab-1, #tab-2

      // 링크 active 토글
      $contsTabLinksGeneral.removeClass("active");
      $link.addClass("active");

      // body-inner 전환
      if ($contsBodyInner.length) {
        $contsBodyInner.removeClass("active");
        $contsBodyInner.filter(`[data-tab="${target}"]`).addClass("active");
      }

      // bottom 전환
      if ($contsBottom.length) {
        $contsBottom.removeClass("active");
        $contsBottom.filter(`[data-tab="${target}"]`).addClass("active");
      }
    });
  }

  // Content Swiper 초기화 (메인 + 썸네일 연동)
  const $contentMainSwiper = $("#contentMainSwiper");
  const $contentThumbsSwiper = $("#contentThumbsSwiper");

  if ($contentMainSwiper.length && $contentThumbsSwiper.length) {
    // 약간의 지연 후 초기화 (DOM 완전 로드 대기)
    setTimeout(() => {
      // 강제로 컨테이너 크기 재계산
      $contentMainSwiper.css("width", "100%");
      $contentThumbsSwiper.css("width", "100%");

      // 썸네일 스와이퍼 먼저 초기화
      const contentThumbsSwiper = new Swiper("#contentThumbsSwiper", {
        spaceBetween: 10,
        slidesPerView: 3,
        slidesPerGroup: 1,
        freeMode: true,
        watchSlidesProgress: true,
        observer: true,
        observeParents: true,
        breakpoints: {
          520: {
            spaceBetween: 12,
            slidesPerView: 4,
          },
          768: {
            spaceBetween: 12,
            slidesPerView: 5,
          },
        },
        on: {
          breakpoint: function () {
            this.update();
          },
        },
      });

      // 메인 스와이퍼 초기화 (썸네일과 연동)
      const contentMainSwiper = new Swiper("#contentMainSwiper", {
        spaceBetween: 10,
        effect: "fade",
        fadeEffect: {
          crossFade: true,
        },
        autoplay: {
          delay: 6000,
          disableOnInteraction: false,
        },
        observer: true,
        observeParents: true,
        thumbs: {
          swiper: contentThumbsSwiper,
        },
      });

      // Swiper 네비게이션 버튼 연결
      const $prevBtn = $(".btn-swiper--prev");
      const $nextBtn = $(".btn-swiper--next");

      if ($prevBtn.length && $nextBtn.length) {
        $prevBtn.on("click", function () {
          contentMainSwiper.slidePrev();
        });

        $nextBtn.on("click", function () {
          contentMainSwiper.slideNext();
        });
      }
    }, 100);
  }
});
