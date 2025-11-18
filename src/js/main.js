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

      const isInsideList = $closestItem
        .closest(".lnb-list")
        .is($lnbItems.parent());

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
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
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
      if (
        !$sitemapInner.is(event.target) &&
        $sitemapInner.has(event.target).length === 0
      ) {
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

    // 슬라이드 너비 계산 함수
    const getSlideWidth = () => {
      const $firstCard = $newsSwiperEl.find(".board-card").first();
      if ($firstCard.length) {
        // 카드 너비 + margin-right
        const cardWidth = $firstCard.outerWidth();
        const marginRight = parseInt($firstCard.css("margin-right")) || 0;
        return cardWidth + marginRight;
      }
      // 기본값 (rem(380) + rem(18) = 398px, 기본 폰트 16px 기준)
      return window.innerWidth <= 768 ? 280 : 398;
    };

    const newsSwiper = new Swiper("#newsSwiper", {
      slidesPerView: "auto",
      spaceBetween: 18,
      slidesPerGroup: 1,
      loop: false,
      pagination: {
        el: ".main-common__progress",
        type: "progressbar",
      },
      on: {
        init: function () {
          // 초기화 후 슬라이드 너비 재설정 (모바일 대응)
          setTimeout(function () {
            newsSwiper.update();
          }, 100);
        },
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

    // 리사이즈 시 이벤트 재설정
    let snbResizeTimer = null;
    $(window).on("resize", function () {
      clearTimeout(snbResizeTimer);
      snbResizeTimer = setTimeout(function () {
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
});
