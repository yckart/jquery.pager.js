/*!
 * jquery.pager.js 0.0.1 - https://github.com/yckart/jquery.pager.js
 * An event-driven pagination plugin for jQuery and you
 *
 * Copyright (c) 2012 Yannick Albert (http://yckart.com)
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 * 2013/03/16
 **/
(function ($, window) {

    var defaults = {
        perPage: 5, // number of items per page
        startPage: 1, // page to begin on - NOT zero indexed
        infinite: false, // true / false

        useHash: false,
        uuid: "pager",
        init: $.noop
    }, uuid = 1;

    $.fn.pager = function (options) {
        return this.each(function () {

            options = $.extend({}, defaults, options); // set options
            var wrap = options.wrapper = $(this);

            wrap.bind({
                'pager:show': function (e, pageNum) {
                    show(options, pageNum - 1, e);
                },

                'pager:next': function () {
                    next(options);
                },

                'pager:prev': function () {
                    prev(options);
                },

                'pager:first': function () {
                    show(options, 0);
                },

                'pager:last': function () {
                    show(options, options.totalPages - 1);
                },

                'pager:refresh': function (e, newopts) {
                    refresh(options, newopts);
                }
            });

            if(options.useHash) {
                $(window).bind("hashchange.pager", function(e){
                    var hash = location.hash;
                    if(!hash) return show(options, options.startPage-1, e);

                    if( options.uuid === hash.slice(0, hash.lastIndexOf(":")).replace("#", "") ) {
                        show(options, hash.slice(-1) -1, e);
                    } else {
                        show(options, options.currentPage, e);
                    }
                });
            }

            setUp(options);
        });
    };

    function setUp(options) {
        options.uuid = options.uuid + uuid++;
        options.perPage = parseInt(options.perPage) || 1;
        options.items = options.wrapper.children();
        options.totalItems = options.items.length;
        options.totalPages = Math.ceil(options.totalItems / options.perPage);
        options.currentPage = parseInt(options.startPage) - 1;
        options.first = isFirstPage(options, options.currentPage);
        options.last = isLastPage(options, options.currentPage);
        options.pages = [];
        if (options.currentPage > options.totalPages - 1) options.currentPage = options.totalPages - 1;

        options.items.hide();

        for (var i = 0; i < options.totalPages; i++) {
            var startItem = options.perPage * i;
            options.pages[i] = options.items.slice(startItem, (startItem + options.perPage));
        }

        if (options.useHash) {
            $(window).trigger("hashchange.pager");
        } else {
            show(options, options.startPage-1);
        }
        options.init.call(this, options.currentPage + 1, options.totalPages);
    }

    function refresh(options, newopts) {
        if (newopts !== undefined) $.extend(options, newopts); // update options
        options.startPage = parseInt(options.currentPage) + 1;
        setUp(options);
    }

    function next(options) {
        if (options.infinite) {
            show(options, (options.last ? 0 : options.currentPage + 1));
        } else {
            show(options, (options.last ? options.totalPages - 1 : options.currentPage + 1));
        }
    }

    function prev(options) {
        if (options.infinite) {
            show(options, (options.first ? options.totalPages - 1 : options.currentPage - 1));
        } else {
            show(options, (options.first ? 0 : options.currentPage - 1));
        }
    }

    function show(options, pageNum, e) {
        if (pageNum > options.totalPages - 1) pageNum = options.totalPages - 1;

        if (!options.pages[options.currentPage].is(':animated')) {
            options.wrapper.trigger('pager:started', options.currentPage + 1);

            $.fn.pager.swapPages(options, pageNum, function () {

                options.currentPage = pageNum;
                options.first = isFirstPage(options, options.currentPage) ? true : false;
                options.last = isLastPage(options, options.currentPage) ? true : false;

                options.wrapper.trigger('pager:finished', [options.currentPage + 1, options.first, options.last]);

            });

            // set hash if available
            if(!e && options.useHash) window.location.hash = options.uuid + ":" + (options.currentPage + 1);
        }

    }

    // public, can override this if neccessary
    $.fn.pager.swapPages = function (options, pageNum, onFinish) {
        options.pages[options.currentPage].hide();
        options.pages[pageNum].show();
        onFinish();
    };

    // utility functions
    function isFirstPage(opts, internalPageNum) {
        return (internalPageNum === 0);
    }

    function isLastPage(options, internalPageNum) {
        return (internalPageNum === options.totalPages - 1);
    }

}(jQuery, window));
