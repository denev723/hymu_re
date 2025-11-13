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
});
