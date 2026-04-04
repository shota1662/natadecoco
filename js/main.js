//logoの表示（トップページのみ・1日1回）
$(window).on('load', function() {
  var path = window.location.pathname;
  var isTop = path === '/' || path.endsWith('index.html');

  if (isTop) {
    var today = new Date().toDateString();
    var lastShown = localStorage.getItem('splashShownDate');

    if (lastShown === today) {
      // 今日すでに表示済み → 即非表示
      $("#splash").hide();
    } else {
      // 初回 or 日付が変わった → 表示して記録
      localStorage.setItem('splashShownDate', today);
      $("#splash").delay(1500).fadeOut('slow');
      $("#splash-logo").delay(1200).fadeOut('slow');
    }
  } else {
    $("#splash").hide();
  }
});

// ========================================
// 国旗じんわり表示（トップページのみ）
// ========================================
$(window).on('load', function() {
  var path = window.location.pathname;
  var isTop = path === '/' || path.endsWith('index.html');
  if (!isTop) return;

  // jack-flag にランダム国旗を割り当て
  var jackFlagCodes = [
    'br','in','ng','mx','au','se','eg','ar','th','ke',
    'pe','no','ph','tr','za','co','id','fr','de','it',
    'es','pt','gh','pk','vn','nz','cl','ma','pl','nl'
  ];
  function shuffleArr(arr) {
    return arr.slice().sort(function() { return Math.random() - 0.5; });
  }
  var jackPicked = shuffleArr(jackFlagCodes);
  $('.jack-flag').each(function(i) {
    $(this).find('.fi').addClass('fi-' + jackPicked[i]);
  });

  // スプラッシュ終了後（約 2200ms）に国旗をじんわり表示
  setTimeout(function() {
    $('.jack-flag').each(function(i) {
      $(this).addClass('is-visible');
    });
  }, 2200);
});

// ========================================
// コラムスライダー
// ========================================
$(document).ready(function () {
    var GAP = 20;
    var pos = 0;
    var $track = $('#columnTrack');
    if ($track.length === 0) return;

    var $cards = $track.find('.column-card');
    var cardCount = $cards.length;
    var $dots = $('#columnDots .column-dot');

    function getVisible() {
        var w = $(window).width();
        if (w < 600) return 1;
        if (w < 900) return 2;
        return 3;
    }

    function getCardWidth() {
        var visible = getVisible();
        var vpWidth = $('.column-viewport').width();
        return (vpWidth - (visible - 1) * GAP) / visible;
    }

    function updateCardWidths() {
        var cw = getCardWidth();
        $cards.css({ 'width': cw + 'px', 'flex-shrink': '0' });
    }

    function moveTo(newPos) {
        var maxPos = cardCount - getVisible();
        pos = Math.max(0, Math.min(newPos, maxPos));
        var step = getCardWidth() + GAP;
        $track.css('transform', 'translateX(-' + (pos * step) + 'px)');
        $dots.removeClass('is-active').eq(pos).addClass('is-active');
        $('.column-prev-btn').prop('disabled', pos === 0);
        $('.column-next-btn').prop('disabled', pos === maxPos);
    }

    function init() {
        pos = Math.min(pos, cardCount - getVisible());
        updateCardWidths();
        moveTo(pos);
    }

    $('.column-prev-btn').on('click', function () { moveTo(pos - 1); });
    $('.column-next-btn').on('click', function () { moveTo(pos + 1); });

    $dots.each(function (i) {
        $(this).on('click', function () { moveTo(i); });
    });

    $(window).on('resize', function () { init(); });
    init();
});

// ========================================
// ホットトピックスライダー
// ========================================
$(document).ready(function () {
    var HT_GAP = 60;
    var htPos = 0;
    var $htTrack = $('#htTrack');
    if ($htTrack.length === 0) return;

    var $banners = $htTrack.find('.ht-banner');
    var bannerCount = $banners.length;
    var $htDots = $('#htDots .ht-dot');

    function getHtVisible() {
        var w = $(window).width();
        if (w < 600) return 1;
        if (w < 900) return 2;
        return 3;
    }

    function getBannerWidth() {
        var visible = getHtVisible();
        var gap = visible === 1 ? 0 : HT_GAP;
        var vpWidth = $('.ht-viewport').width();
        return (vpWidth - (visible - 1) * gap) / visible;
    }

    function updateBannerWidths() {
        var bw = getBannerWidth();
        $banners.css({ 'width': bw + 'px', 'flex-shrink': '0' });
        var gap = getHtVisible() === 1 ? 0 : HT_GAP;
        $htTrack.css('gap', gap + 'px');
    }

    function htMoveTo(newPos) {
        var htMax = Math.max(0, bannerCount - getHtVisible());
        htPos = Math.max(0, Math.min(newPos, htMax));
        var gap = getHtVisible() === 1 ? 0 : HT_GAP;
        var step = getBannerWidth() + gap;
        $htTrack.css('transform', 'translateX(-' + (htPos * step) + 'px)');
        $htDots.removeClass('is-active').eq(htPos).addClass('is-active');
        $('.ht-prev-btn').prop('disabled', htPos === 0);
        $('.ht-next-btn').prop('disabled', htPos === htMax);
    }

    function htInit() {
        htPos = Math.min(htPos, bannerCount - getHtVisible());
        updateBannerWidths();
        htMoveTo(htPos);
    }

    $('.ht-prev-btn').on('click', function () { htMoveTo(htPos - 1); });
    $('.ht-next-btn').on('click', function () { htMoveTo(htPos + 1); });

    $htDots.each(function (i) {
        $(this).on('click', function () { htMoveTo(i); });
    });

    $(window).on('resize', function () { htInit(); });
    htInit();
});

// ========================================
// 実績カウントアップ
// ========================================
$(document).ready(function () {
    var counted = false;

    function countUp() {
        $('.stat-number').each(function () {
            var $el = $(this);
            var target = parseInt($el.data('target'));
            var duration = 1600;
            var start = 0;
            var step = Math.ceil(target / (duration / 16));

            var timer = setInterval(function () {
                start += step;
                if (start >= target) {
                    $el.text(target.toLocaleString());
                    clearInterval(timer);
                } else {
                    $el.text(start.toLocaleString());
                }
            }, 16);
        });
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !counted) {
                counted = true;
                countUp();
            }
        });
    }, { threshold: 0.3 });

    var target = document.querySelector('.achievements');
    if (target) observer.observe(target);
});

// ========================================
// 私たちの想いセクション・国旗ランダム表示
// ========================================
$(document).ready(function() {
  var flagCodes = [
    'br','in','ng','mx','au','se','eg','ar','th','ke',
    'pe','no','ph','tr','za','co','id','fr','de','it',
    'es','pt','gh','pk','vn','nz','cl','ma','pl','nl'
  ];

  function shuffle(arr) {
    return arr.slice().sort(function() { return Math.random() - 0.5; });
  }

  var flags = document.querySelectorAll('.msg-flag');
  if (!flags.length) return;

  var picked = shuffle(flagCodes).slice(0, flags.length);
  flags.forEach(function(el, i) {
    var fi = el.querySelector('.fi');
    fi.classList.add('fi-' + picked[i]);
  });

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        flags.forEach(function(el) { el.classList.add('is-visible'); });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  var section = document.querySelector('.our-message') || document.querySelector('.event-list-section');
  if (section) observer.observe(section);
});

// Read more トグル
$(document).on('click', '.voice-read-more', function() {
  var $btn = $(this);
  var $more = $btn.prev('.voice-text').find('.voice-text-more');
  var expanded = $btn.attr('aria-expanded') === 'true';
  $more.toggle(!expanded);
  $btn.attr('aria-expanded', (!expanded).toString());
  $btn.text(expanded ? 'read more' : 'close');
});

// ハンバーガーメニュー
$(document).ready(function() {
  $('.hamburger').on('click', function() {
    $(this).toggleClass('is-open');
    $(this).attr('aria-expanded', $(this).hasClass('is-open').toString());
    $('.mobile-menu').toggleClass('is-open');
  });

  // メニュー外クリックで閉じる
  $(document).on('click', function(e) {
    if (!$(e.target).closest('#header').length) {
      $('.hamburger').removeClass('is-open').attr('aria-expanded', 'false');
      $('.mobile-menu').removeClass('is-open');
    }
  });
});
// 執筆者クリックでメンバーページへ遷移（カード内の入れ子<a>回避）
document.addEventListener('click', function(e) {
    const author = e.target.closest('[data-member-link]');
    if (author) {
        e.preventDefault();
        e.stopPropagation();
        const name = author.getAttribute('data-member-link');
        window.location.href = 'member.html#' + encodeURIComponent(name);
    }
});

// ========================================
// スクロールリビール（全ページ共通）
// ========================================
$(document).ready(function() {

  // --- 単体でフェードインする要素 ---
  var singleTargets = [
    '.opening-message',
    '.our-message-inner',
    '.achievements',
    '.contact-inner',
    '.sch-message-body',
    '.sch-past-municipalities',
    '.cases-appeal',
    '.cases-stats',
    '.vol-appeal',
    '.vol-role-columns',
    '.volunteer-voices',
  ];

  singleTargets.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) {
      el.classList.add('reveal');
    });
  });

  // --- グリッド系カード（親ごとにスタガー） ---
  var staggerTargets = [
    // index
    '.service-card', '.column-card', '.partner-card', '.sponsor-card',
    // school
    '.sch-strength-card', '.sch-case-card', '.sch-flow-step',
    // cases
    '.case-card', '.cases-stat-item',
    // event
    '.event-card',
    // activities
    '.act-classroom-card', '.act-kit-card', '.act-other-card',
    // foreigner
    '.fgn-activity-card', '.fgn-why-card', '.fgn-voice-card', '.fgn-flow-step',
    // volunteer
    '.vol-voice-card', '.vol-activity-card', '.vol-appeal-card', '.vol-flow-step',
    // kit
    '.kit-point-card', '.kit-step',
    // reports / rd
    '.rd-voice-card', '.rd-staff-card', '.rd-organizer-card', '.rd-related-card', '.rpt-card',
    // column detail
    '.cd-related-card', '.cd-voice-box',
    // lp / m2
    '.lp-persona-card', '.lp-pricing-card', '.m2-card',
    // generic
    '.flow-step', '.form-card', '.cta-card',
  ];

  var delayClasses = ['reveal-d1','reveal-d2','reveal-d3','reveal-d4'];

  staggerTargets.forEach(function(sel) {
    // 同じ親コンテナ内でスタガーをリセット
    var seen = new Map();
    document.querySelectorAll(sel).forEach(function(el) {
      var parent = el.parentElement;
      var idx = seen.has(parent) ? seen.get(parent) : 0;
      el.classList.add('reveal');
      if (idx < 4) el.classList.add(delayClasses[idx]);
      seen.set(parent, idx + 1);
    });
  });

  // --- IntersectionObserver で画面内に入ったら表示 ---
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function(el) {
    revealObserver.observe(el);
  });
});
