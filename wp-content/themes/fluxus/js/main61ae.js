;(function ($, window, $window, $document, isUndefined) {

    $(function () {

        var $html       = $('html'),
            $main       = $('#main'),
            $header     = $('#header'),
            $footer     = $('#footer'),

            // Components
            $sidebar             = $('.sidebar'),
            $keyRight            = $('#key-right'),
            $keyLeft             = $('#key-left'),
            $navTip              = $('.nav-tip'),
            $scrollContainer     = $('.scroll-container'),
            mobileNav,

            // Functions
            getHorizontalPageHeight,
            pageResizer,

            // Gloal variables
            allowUpscale = $html.is('.upscale');

        getHorizontalPageHeight = function () {
            return $window.height() - $header.outerHeight() - $footer.outerHeight();
        };

        /**
         * Fixes iOS 7.0~7.0.2 Safari bug. Safari reports $window.height() to be 692, which is not correct.
         * Also there's a permanent scrollbar which allows users to scroll 20px, to prevent that we just scroll back to the
         * top. This is only required in landscape mode.
         */
        if (!!navigator.platform.match(/iPad/) && $html.is('.horizontal-page')) {
            var _getHorizontalPageHeight = getHorizontalPageHeight,
                scrollToTop = function () {
                    // Scroll to top when we have horizontal page.
                    // > 768 is needed since horizontal pages turn into vertical on small devices (eg. iPad Mini)
                    if (($(window).scrollTop() > 0) && ($(window).width() > 768)) {
                        $('body').animate({ scrollTop: 0 }, 200);
                    }
                };

            getHorizontalPageHeight = function () {
                // We need to modify the height forumla for iPad due to iOS bug
                if ($window.height() == 692) {
                    return window.innerHeight - $header.outerHeight() - $footer.outerHeight();
                }
                // Otherwise return height using standard calculation
                return _getHorizontalPageHeight();
            };

            $document.on('scroll', _.debounce(scrollToTop, 100));

            $window.on('orientationchange.ios7-safari-bug.fluxus', function () {
                setTimeout(function () {
                    if ($window.height() == 692) {
                        scrollToTop();
                    }
                }, 200);
            });
        }

        $('.horizontal-page').each(function () {

            var resizer = function () {

                var windowWidth = $window.width(),
                    windowHeight = $window.height(),
                    // The header is position:fixed we have to calculate the offset for main page dynamically.
                    headerHeight = $header.outerHeight();
                    footerHeight = $footer.outerHeight();

                // If we are on a small screen
                if (windowWidth <= 568) {

                    if ($html.is('.no-scroll')) {
                        $main.css({
                            height: windowHeight - headerHeight,
                            top: 0
                        });
                    } else {
                        $main.css({
                            height: 'auto',
                            top: 0
                        });
                    }

                } else {

                    $main.css({
                        height: getHorizontalPageHeight(),
                        top: headerHeight
                    });

                }

            };

            $window.on('resize.horizontal-page.fluxus', _.debounce(resizer));
            resizer();

            $window.on('orientationchange.horizontal-page.fluxus', function () {
                setTimeout(resizer, 10);
            });

            $main.transition({
                opacity: 1
            }, 100);

        });

        /**
         * General size adjustments on window resize.
         */
        pageResizer = function () {

            /**
             * Update tinyscrollbar values.
             */
            $scrollContainer.each(function () {
                var $t = $(this),
                    tsb = $t.data('tsb');

                $t.find('.scrollbar, .track').css('height', $t.height());
                tsb && tsb.update();
            });


            if ($window.width() <= 768) {

                // Initialize mobile menu only if we have a small sceen size.
                if (!mobileNav) {

                    // Make mobile menu item array.
                    var $siteNavigation = $('.site-navigation'),
                        $mobileNavItems = $siteNavigation.find('a').filter(function () {

                            var $t = $(this),
                                level = $t.parents('ul').length;

                            $t.data('level', level);

                            if (level == 1) {
                                return true;
                            } else {
                                if ($t.closest('.current-menu-item, .current_page_ancestor').length) {
                                    return true;
                                }
                            }
                            return false;

                        });

                    /**
                     * Initialize mobile menu.
                     */
                    mobileNav = new MobileNav($mobileNavItems, {
                        openButtonTitle: $siteNavigation.data('menu'),
                        active: $siteNavigation.find('.current-menu-item > a')
                    });

                }

            }

            /**
             * Trigger vertical center plugin.
             */
            setTimeout(function () {
                $('.js-vertical-center').verticalCenter();
            }, 100);

        };

        $window.on('resize.page-resizer.fluxus', _.debounce(pageResizer));
        pageResizer();

        /**
         * Arrows and mousewheel navigation plugin.
         */
        globalNav = new Navigation({
            onSetItems: function () {
                this.$items.length && $navTip.show();
            }
        });

        /**
         * Full page slider
         */
        $('.slider').each(function () {

            var $slider = $(this),
                slider;

            $slider.fluxusSlider({
                    onNextSlide: function () {
                        globalNav.options.onNextItem();
                    },
                    onPreviousSlide: function () {
                        globalNav.options.onPreviousItem();
                    }
                });

            slider = $slider.data('slider');

            slider.slideCount > 1 && $navTip.show();

            globalNav.disableKeyboard();

            $keyRight.click(function (e) {
                slider.next();
                e && e.preventDefault();
            });

            $keyLeft.click(function (e) {
                slider.previous();
                e && e.preventDefault();
            });

        });


        /**
         * Appreciate plugin
         */
        var $appreciate = $('.btn-appreciate');
        $appreciate.appreciate();


        /**
         * Sharrre plugin
         */
        $('#sharrre-footer').each(function () {

            var $el = $(this),
                services = {},
                buttonsTitle = $el.data('buttons-title');

            if (!$el.data('services')) {
                return;
            }

            // retrieve social networks from DOM element.
            $.each($el.data('services').split(','), function () {
                services[this] = true;
            });

            $el.sharrre({
                share: services,
                buttonsTemplate: buttonsTitle ? '<b>' + buttonsTitle + '<a href="#" class="close"></a></b>' : '',
                urlCurl: $el.data('curl'),
                template: '<b class="share">{title}</b>' +
                          '<span class="counts">' +
                            (services.facebook ? '<b class="count-facebook">{facebook}</b>' : '') +
                            (services.twitter ?'<b class="count-twitter">{twitter}</b>' : '') +
                            (services.googlePlus ?'<b class="count-plus">{plus}</b>' : '') +
                          '</span>',
                render: function(self, options) {
                    var html = this.template.replace('{title}', options.title);
                    html = html.replace('{facebook}', options.count.facebook);
                    html = html.replace('{twitter}', options.count.twitter);
                    html = html.replace('{plus}', options.count.googlePlus);
                    $(self.element).html(html);
                    $el.show();
                }
            });

        });

        $('#sharrre-project').each(function () {

            var $el = $(this),
                services = {},
                buttonsTitle = $el.data('buttons-title');

            if (!$el.data('services')) {
                return;
            }

            // retrieve social networks from DOM element.
            $.each($el.data('services').split(','), function () {
                services[this] = true;
            });

            $el.sharrre({
                share: services,
                buttonsTemplate: buttonsTitle ? '<div class="arrow"></div><b>' + buttonsTitle + '<a href="#" class="close"></a></b>' : '',
                urlCurl: $el.data('curl'),
                template: '<span class="icon"></span><div class="box">' +
                            '<a class="share" href="#">{title}</a>' +
                            '<b class="count-total">{total}</b>' +
                          '</div>',
                render: function(self, options) {
                    var total = options.shorterTotal ? self.shorterTotal(options.total) : options.total,
                        html = this.template.replace('{title}', options.title).replace('{total}', total);
                    $(self.element).html(html);
                    $el.css('display', 'inline-block');
                },
                afterLoadButtons: function () {
                    var index = 0,
                        $buttons = this.$el.find('.button'),
                        count = $buttons.each( function () {
                                    index++;
                                    $(this).addClass('button-' + index);
                                }).length;
                    this.$el.addClass('social-services-' + count);
                }
            });

        });


        /**
         * Fixes menu issue, when popup is outside the screen.
         * Supports WPML menu items.
         */
        $('.site-navigation .has-children, .menu-item-language').hover(function () {

            var $submenu = $(this).children('.sub-menu');
            if ($submenu.length) {

                // if popup is outside the screen, then align it by the right side of the screen.
                if ($submenu.offset().left + $submenu.outerWidth() - $(document).scrollLeft() > $window.width()) {
                    $submenu.addClass('sub-menu-right');
                }

            }

        }, function () {

            $(this).children('.sub-menu').removeClass('sub-menu-right');

        });


        /**
         * If our page has a horizontal layout.
         */
        if ($html.is('.horizontal-page')) {

            /**
             * Enable tinyscrollbar plugin.
             */
            $scrollContainer.tinyscrollbar({
                axis: 'y'
            });

            /**
             * Enable keyboard navigation.
             */
            globalNav.options.onNextItem = function () {
                $keyRight.addClass('flash');
                setTimeout(function () {
                    $keyRight.removeClass('flash');
                }, 200);
            };

            globalNav.options.onPreviousItem = function () {
                $keyLeft.addClass('flash');
                setTimeout(function () {
                    $keyLeft.removeClass('flash');
                }, 200);
            };

            $keyRight.click(function (e) {
                globalNav.nextItem();
                e && e.preventDefault();
            });

            $keyLeft.click(function (e) {
                globalNav.previousItem();
                e && e.preventDefault();
            });

        }


        /**
         * --------------------------------------------------------------------------------
         * Specific pages
         * --------------------------------------------------------------------------------
         */


        /**
         * Page: Grid Portfolio
         */
        if ($html.is('.layout-portfolio-grid')) {

            (function () {

                var $grid = $('.portfolio-grid'),
                    defaults = $.extend({}, $.Grid.defaults, $grid.data()),
                    options,
                    grid,
                    resizer;

                if (!window.getGridOptions) {
                    window.getGridOptions = function () {
                        var windowWidth = $window.width(),
                            windowHeight = $window.height(),
                            options = {
                                orientation: defaults.orientation,
                                rows: defaults.rows,
                                columns: defaults.columns
                            };

                        if (windowWidth <= 568) {
                            options.columns = 1;
                            options.rows = Math.ceil(windowHeight / 378);
                            options.orientation = 'vertical';
                        } else if (windowWidth <= 768) {
                            if (defaults.columns > 2) {
                                options.columns = 2;
                            }
                            options.rows = Math.ceil(windowHeight / 250)
                        } else if (windowWidth <= 1024) {
                            if (defaults.columns > 3) {
                                options.columns = 3;
                            }
                            if (defaults.rows > 3) {
                                options.rows = 3;
                            }
                        }
                        return options;
                    };
                }
                options = $.extend({}, defaults, window.getGridOptions());

                $grid.find('.inner').vcenter();

                options.onRenderStart = function () {
                    var options = this.options,
                        isVertical = options.orientation == 'vertical',
                        isAspectRatioAuto = options.aspectRatio == 'auto',
                        itemsPerScreen = options.rows * options.columns,
                        pageHeight;

                    /**
                     * When there are more items than could be fitted into a viewport,
                     * then footer will get pushed out of screen, which means we need to remove it from our container
                     * height calculation.
                     */
                    if (isVertical && isAspectRatioAuto && (itemsPerScreen < $grid.children().length)) {
                        pageHeight = $window.height() - $header.outerHeight() - options.gutterHeight;
                    } else {
                        pageHeight = getHorizontalPageHeight();
                    }

                    $grid.css('height', pageHeight);

                    options = window.getGridOptions();
                    this.options.orientation = options.orientation;
                    this.options.rows = options.rows;
                    this.options.columns = options.columns;
                };

                options.onRenderComplete = function (coords) {
                    if (this.isHorizontal()) {
                        if ($grid.width() < coords.rightmostX) {
                            coords.$rightmost.css('padding-right', this.options.gutterWidth);
                            $navTip.show();
                        } else {
                            coords.$rightmost.css('padding-right', 0);
                            $navTip.hide();
                        }
                    } else {
                        $main.css('height', coords.bottommostY);
                    }
                    this.$items.each(function () {
                        var $el = $(this),
                            $preview,
                            img;

                        if ($el.width() > 583) {
                            $preview = $el.children('.preview')
                            if (!$preview.is('.hd-image')) {
                                $preview.addClass('hd-image');
                                if ($preview.data('hd-image')) {
                                    img = new Image();
                                    $(img).load(function () {
                                        $preview.css('background-image', 'url(' + img.src + ')');
                                    });
                                    img.src = $preview.data('hd-image');
                                }
                            }
                        }
                    });
                };

                /**
                 * Enable Grid plugin.
                 */
                $grid.grid(options);
                grid = $grid.data('grid');

                if (grid.isHorizontal()) {

                    globalNav.setItems(grid.$items);

                    var gutter = grid.options.gutterWidth;

                    globalNav.options.nextItem = function () {
                        var windowRight = $window.scrollLeft() + $window.width() - 30,
                            nextItem;

                        // Find the first item that is not being fully displayed
                        // and scroll to that item.
                        $.each(grid.lastRender.coords.coordinates, function (index) {
                            if ((this.x > windowRight) || ((this.rightX - gutter) > windowRight)) {
                                nextItem = this;
                                return false;
                            }
                        });

                        if (nextItem) {
                            this.scrollTo(nextItem.rightX - $window.width() + gutter * 2);
                            this.options.onNextItem && this.options.onNextItem.call(this);
                        }
                    };

                    globalNav.options.previousItem = function () {
                        var windowLeft = $window.scrollLeft(),
                            previousItem;

                        // Find the first item that is fully visible and scroll to the previous one.
                        $.each(grid.lastRender.coords.coordinates, function (index) {
                            if (index && (this.x >= windowLeft)) {
                                previousItem = grid.lastRender.coords.coordinates[index - 1];
                                return false;
                            }
                        });

                        if (previousItem) {
                            this.scrollTo(previousItem.x);
                            this.options.onPreviousItem && this.options.onPreviousItem.call(this);
                        }
                    };

                }
            })();

        }


        /**
         * Page: Horizontal Portfolio
         */
        $('.portfolio-list').each(function () {

            var $el = $(this),
                $projects = $el.find('.project'),
                $images = $el.find('.featured-image'),
                $info = $el.find('.info'),
                $hoverContents = $el.find('.hover-box-contents'),
                resizer;

            resizer = function () {

                var highest, totalWidth,
                    windowWidth = $window.width();

                if (windowWidth > 768) {

                    highest = $info.highestElement().outerHeight();

                    $images.each(function () {
                        var $t = $(this),
                            maxHeight = allowUpscale ? 3000 : $t.attr('height'),
                            height = $main.height() - highest;

                        if ($t.is('img')) {
                            $t.css('height', height > maxHeight ? maxHeight : height);
                        }
                    });

                    $hoverContents.vcenter();

                    if ($html.is('.ipad-ios4')) {

                        totalWidth = 0;

                        $el.children().each(function () {
                            totalWidth += $(this).width();
                        });

                        $el.css('width', totalWidth);

                    }

                } else {

                    if (windowWidth <= 568) {
                        $el.find('.info').css('height', 'auto');
                    }

                    $html.is('.ipad-ios4') && $el.css('width', 'auto');

                }

            };

            resizer();
            $window.on('resize.horizontal-portfolio.fluxus', _.debounce(resizer));

            // Set keyboard navigation items.
            globalNav.setItems($projects);

            // Show project on image load, which prevents flickering.
            $projects.each(function () {
                var $t   = $(this),
                    $img = $t.find('.featured-image');

                $.preloadImage($img.attr('src')).then(function () {
                    $t.addClass('loaded');
                });
            });

            // Use JS to show hover box contents for landscape oriented iPad's
            $el.find('.hover-box').click(function (e) {
                if ((e.target == this) && ($window.width() > 768)) {
                    var $t = $(this);
                    if ($t.css('opacity') == 0) {
                        $t.transition({ opacity: 1 }, 500);
                    }
                }
            });

        });


        /**
         * Page: Portfolio Single
         */
        $('.portfolio-single').each(function () {

            var $mediaList = $(this),
                $horizontalItems = $('.horizontal-item'),
                $resizable = $mediaList.find('.image, iframe'),
                $navigation = $('.portfolio-navigation'),
                $navigationLike = $navigation.find('header'),
                $navigationOther = $navigation.find('.navigation'),
                $navigationOtherProjects = $navigationOther.find('.other-projects');

            globalNav.setItems($horizontalItems.add($navigation));

            if ( $mediaList.data('onclick-action') == 'scroll' ) {

                // Activate click to scroll navigation
                $('.project-image-link').on('click.click-to-scroll.fluxus', function (e) {
                    e && e.preventDefault();

                    var $item = $(this).closest('.horizontal-item'),
                        activeItem = globalNav.getActive();
                        $activeItem = activeItem.item;

                    if ( $activeItem.length && $item.length ) {

                        if ( ($item[0] == $activeItem[0]) && (Math.abs(activeItem.distance) <= 10) ) {
                            globalNav.nextItem();
                        } else {
                            globalNav.scrollToItem($item);
                        }

                    }
                });

            } else {

                // Bind Lightbox to image links and iframes
                $('.project-image-link, .horizontal-item iframe').fluxusLightbox({
                    onShow: function () {
                        globalNav.disableKeyboard();
                        globalNav.disableMousewheel();
                    },
                    onHide: function () {
                        globalNav.enableKeyboard();
                        globalNav.enableMousewheel();
                    },
                    loading: $mediaList.data('loading')
                });

            }

            $resizable.each(function () {
                var $t = $(this),
                    width = $t.data('width') || $t.attr('width') || 1,
                    height = $t.data('height') || $t.attr('height') || 1;
                $t.data({
                    height: height,
                    ratio: width / height
                });
            });

            var resizer = function () {

                var contentHeight = getHorizontalPageHeight(),
                    windowWidth = $window.width(),
                    windowHeight = $window.height(),
                    otherHeight = $navigationOther.outerHeight(),
                    likeHeight = $navigationLike.outerHeight(),
                    temp;

                if (!$navigationOtherProjects.is(':visible')) {
                    $navigationOtherProjects.css('visibility', 'hidden').show();
                    otherHeight = $navigationOther.outerHeight();
                    $navigationOtherProjects.hide().css('visibility', 'visible');
                }

                $resizable.each(function () {

                    var $t = $(this),
                        originalHeight = $t.data('height'),
                        height = contentHeight > originalHeight ? originalHeight : contentHeight,
                        width,
                        ratio = $t.data('ratio'),
                        upscale = allowUpscale;

                    if (window.disable_video_upscale && $t.is('iframe')) {
                        upscale = false;
                    }

                    if (window.enable_video_upscale && $t.is('iframe')) {
                        upscale = true;
                    }

                    if (upscale) {
                        height = contentHeight;
                    }

                    // Horizontal layout
                    if (windowWidth > 768) {

                        width = height * ratio;
                        if ( !window.allow_exceeding_width ) {
                            width = windowWidth > width ? width : windowWidth - 30;
                        }

                        $t.css({
                            width: width,
                            maxWidth: 'none', // required for webkit
                            height: width / ratio
                        });

                    // Vertical layout
                    } else {

                        if ($t.is('iframe')) {
                            $t.css({
                                width: '100%',
                                maxWidth: upscale ? 'none' : (height * ratio)
                            });
                            $t.css('height', $t.width() / ratio);
                        } else {
                            $t.css({
                                width: upscale ? '100%' : 'auto',
                                maxWidth: upscale ? 'auto' : '100%',
                                height: 'auto'
                            });
                        }

                    }

                });

                if (windowWidth <= 768) {

                    $('#content').addTempCss('padding-top', $sidebar.outerHeight() + 30);
                    $navigationLike.css('top', 0);

                } else {

                    $('#content').removeTempCss('padding-top');

                    if ( contentHeight < otherHeight + likeHeight ) {
                        $navigationOtherProjects.hide();

                        temp = (contentHeight - otherHeight - likeHeight + $navigationOtherProjects.outerHeight()) / 2;
                        $navigationLike.css('top', temp > 0 ? temp : 0);
                    } else {
                        $navigationOtherProjects.show()

                        temp = (contentHeight - otherHeight - likeHeight) / 2;
                        $navigationLike.css('top', temp);
                    }

                }

                if ($html.is('.ipad-ios4')) {

                    var totalWidth = 0;

                    $mediaList.children().each(function () {
                        totalWidth += $(this).width();
                    });

                    $mediaList.css({
                        width: totalWidth
                    });

                }

            };

            $window.on('resize.fluxus.portfolio-single', _.debounce(resizer));
            resizer();

            // Fade in images and videos once loaded.
            if (!$mediaList.data('lazy')) {

                // Don't animate on iOS devices to prevent from crashing.
                if (window.device.ios) {
                    $horizontalItems.css('opacity', 1);
                } else {

                    $horizontalItems.each(function () {
                        var $t = $(this);

                        if ($t.is('.project-image')) {
                            $.preloadImage($t.find('.image').attr('src')).then(function () {
                                $t.transition({ opacity: 1 }, 500);
                            });
                        } else {
                            $t.transition({ opacity: 1 }, 500);
                        }
                    });

                }

            } else {

                var $lazyImages = $('.lazy-image'),
                    lazyLoading;

                $lazyImages.on('loadImage.fluxus', function () {

                    var $t = $(this).off('loadImage.fluxus');

                    $.preloadImage($t.data('src')).then(function (img) {

                        var $img = $('<img />').attr('src', img.src);

                        $t.addClass('lazy-image-loaded').append($img);
                        $img.transition({ opacity: 1 }, 400);

                    });

                });

                lazyLoading = function (e) {

                    $lazyImages.each(function () {
                        var $t = $(this),
                            imageLeftPoint = $t.offset().left,
                            imageRightPoint = imageLeftPoint + $t.width(),
                            windowLeftPoint = $window.scrollLeft(),
                            windowRightPoint = windowLeftPoint + $window.width();

                        if ((windowLeftPoint < imageRightPoint) && (windowRightPoint > imageLeftPoint )) {
                            $t.triggerHandler('loadImage');
                            $lazyImages = $lazyImages.not($t);
                        }
                    });

                    if (!$lazyImages.length) {
                        $window.off('scroll.fluxus.single-portfolio');
                        $window.off('resize.fluxus.single-portfolio');
                    }

                };

                lazyLoading();
                $window.on('scroll.fluxus.single-portfolio', lazyLoading);
                $window.on('resize.fluxus.single-portfolio', _.debounce(lazyLoading));

            }

        });


        /**
         * Page: Vertical Blog
         */
        $('.vertical-blog').each(function () {

            $videos = $('.wrap-embed-video iframe');

            var resizer = function () {

                if ($window.width() > 768) {
                    $sidebar.css('height', $main.height());
                } else {
                    $sidebar.css('height', 'auto');
                }

                $videos.each(function () {

                    var $t = $(this),
                        maxHeight = $t.attr('height'),
                        maxWidth = $t.attr('width'),
                        ratio = maxHeight ? maxWidth / maxHeight : false;

                    if (ratio) {

                        $t.css('width', '100%');
                        $t.css('height', parseInt($t.width(), 10) / ratio);

                    }

                });

            };

            resizer();
            $window.on('resize.vertical-blog.fluxus', _.debounce(resizer));

        });


        /**
         * Page: Horizontal Blog
         */
        $('.horizontal-posts').each(function () {

            var $excerpts = $('.post-with-media .text-contents'),
                $resizable = $('.resizable'),
                $videos = $('.wrap-embed-video'),
                $posts = $('.post'),
                resizer;

            /**
             * Measures the highest content area, then calculates available space
             * and makes sure that every image uses the same height.
             */
            resizer = function () {

                var maxExcerptHeight = $excerpts.highestElement().outerHeight(),
                    maxMediaHeight;

                if (!maxExcerptHeight) {
                    return;
                }

                maxMediaHeight = $main.height() - maxExcerptHeight;
                maxMediaHeight = maxMediaHeight > 328 ? 328 : maxMediaHeight; // limit max height to 328

                // Set sizes for images
                $resizable.each(function () {

                    var $t = $(this),
                        postWidth = $t.css('height', maxMediaHeight).width();

                    postWidth = postWidth < 583 ? 583 : postWidth;

                    $t.closest('.post').css('width', postWidth);

                });

                // Set sizes for videos
                $videos.each(function () {

                    var $t = $(this),
                        $article = $t.closest('article'),
                        $object = $t.children('iframe:first'),
                        ratio = $object.data('ratio'),
                        postWidth;

                    if (!ratio) {
                        if ($object.attr('width') && $object.attr('height')) {
                            ratio = $object.attr('width') / $object.attr('height');
                        } else {
                            ratio = 16 / 9;
                        }
                        $object.data('ratio', ratio);
                    }

                    postWidth = maxMediaHeight * ratio;
                    postWidth = postWidth < 500 ? 500 : postWidth;

                    $object.css({
                        height: maxMediaHeight,
                        width: maxMediaHeight * ratio
                    });
                    $article.css('width', postWidth);

                });

            };

            resizer();
            $window.on('resize.horizontal-posts.fluxus', _.debounce(resizer));

            globalNav.setItems($posts.add($('.navigation-paging')));

            return;

        });

        /**
         * Page: Blog Single
         */
         $('.single-post').each(function () {
            var $video = $('.wrap-embed-video iframe'),
                $videoParent,
                embedWidth,
                embedHeight,
                ratio,
                resizer;

            if (!$video.length) {
                return false;
            }

            $videoParent = $video.parent();

            embedWidth = $video.attr('width') || $video.width();
            embedHeight = $video.attr('height') || $video.height();
            ratio = embedWidth / embedHeight;

            resizer = function () {
                var width = $videoParent.width(),
                    maxWidth = allowUpscale ? 1080 : embedWidth;

                width = width > maxWidth ? maxWidth : width;

                $video.css({
                    width: width,
                    height: width / ratio
                });
            };

            resizer();
            $window.on('resize.single-post.fluxus', _.debounce(resizer));
         });


        /**
         * Page: Contacts
         */
        $('.page-contacts').each(function () {

            var $contactsForm = $('.wpcf7'),
                $infobox = $(this).find('.page'),
                $viewport = $infobox.children('.viewport'),
                iscroll,
                resizer;

            if ($contactsForm.length) {
                $contactsForm.detach();
                $('#contacts-modal .modal-contents').append( $contactsForm );
            }

            $('#send-message').click(function () {
                $('#contacts-modal').reveal({
                    closeonbackgroundclick: true,
                    middle: true
                });
                return false;
            });

            if (!window.oldie) {
                iscroll = new iScroll($infobox.get(0), {
                        hideScrollbar: false,
                        scrollbarClass: 'iscrollbar'
                    });
            }

            resizer = function () {

                var infoHeight = $infobox.outerHeight(),
                    mainHeight = getHorizontalPageHeight();

                if ($viewport.height() > mainHeight) {

                    $infobox.css({
                        top: 0,
                        height: '100%'
                    });

                    if (iscroll && !iscroll.enabled) {
                        iscroll.enable();
                    }
                    iscroll && iscroll.refresh();

                } else {

                    var top = Math.round( ( mainHeight - infoHeight ) / 2 );
                    top = top < 0 ? 0 : top;

                    $infobox.css({
                        top: top,
                        height: 'auto'
                    });

                    iscroll && iscroll.enabled && iscroll.disable();

                }

            };

            resizer();
            $window.on('resize.contacts.fluxus', _.debounce(resizer));

        });


        $('.link-to-image').fluxusLightbox();



        /**
         * --------------------------------------------------------------------------------
         * Shortcodes.
         * --------------------------------------------------------------------------------
         */

        /**
         * Shortcode: Tabs
         */
        $('.tabs').each(function () {

            var $t = $(this);

            $t.find('.tabs-menu a').click(function () {

                var $t = $(this ),
                    $p = $t.parent(),
                    index = $p.prevAll().length;

                if ( $p.is('.active') ) {
                    return false;
                }

                $p.parent().find('.active').removeClass('active');
                $p.addClass('active');

                $p.closest('.tabs').find('.tab').hide().end().find('.tab:eq(' + index + ')').show();

                return false;

            }).each(function (index) {

                $(this).wrapInner($('<span />'))
                       .append($('<b>' + (index + 1) + '</b class="index">'));

            });

        });


        /**
         * Shortcode: Accordion
         */
        $('.accordion').each(function () {

            var $accordion = $(this);

            $accordion.find('.panel-title a').click(function () {
                var $t = $(this);

                /**
                 * This is the active panel. Let's collapse it.
                 */
                if ($t.closest('.panel-active').length) {
                    $t.closest('.panel-active').find('.panel-content').slideUp(500, function () {
                        $(this).closest('.panel-active').removeClass('panel-active');
                    });
                    return false;
                }

                var $newPanel = $t.closest('.panel'),
                    index = $newPanel.prevAll().length;

                $panelActive = $accordion.find('.panel-active');

                if ($panelActive.length) {

                    $panelActive.find('.panel-content').slideUp(500, function () {
                        $(this).closest('.panel').removeClass('panel-active');
                        $accordion.find('.panel:eq(' + index + ') .panel-content').slideDown(300)
                                  .closest('.panel').addClass('panel-active');

                    });

                } else {

                    $accordion.find('.panel:eq(' + index + ') .panel-content').slideDown(300)
                              .closest('.panel').addClass('panel-active');

                }

                return false;
            });

        });


        /**
         * Shortcode: Gallery
         */
        $('.gallery-link-file').each(function () {
            $(this).find('a').fluxusLightbox();
        });

        if (window.oldie) {
            $('.portfolio-navigation .other-projects a').each(function () {
                var $t = $(this),
                    image_url = $t.css('background-image').slice(5, -2);

                $t.css({
                    'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + image_url + "', sizingMethod='scale')",
                    '-ms-filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + image_url + "', sizingMethod='scale')"
                });
            });
        }

    });

})(jQuery, window, jQuery(window), jQuery(document));