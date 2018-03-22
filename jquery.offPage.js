/**
 * jQuery offPage
 * Version 1.7
 * http://github.com/Kenuzara/jquery-offPage/
 * Modified version of Scott Robin's pageslide plugin
 * http://srobbin.com/jquery-pageslide/
 *
 * jQuery Javascript plugin which slides a webpage over to reveal an additional interaction pane.
 *
 * Copyright (c) 2014-2018 Chris McClean (wheelercentral.net)
 * Dual licensed under the MIT and GPL licenses.
 * 
 * -- OPTIONS (and their defaults) --
 *  animMethod:  'overlay',         // Accepts 2 options: 'overlay' or 'push', controls how the panel enters the viewport.
 *  speed:       540,               // Accepts standard jQuery effects speeds (i.e. fast, normal or milliseconds)
 *  direction:   'left',            // Direction offPage enters from, accepts 'left' or 'right' or 'up' or 'down'.
 *  easing:      'easeInOutQuad',   // See ui_functions.js Effects -> Easing section for available easing options.
 *  modal:       false,             // If set to true, you must explicitly close offPage using $.offPage.close();
 *  iframe:      true,              // By default, linked pages are loaded into an iframe. Set this to false if you don't want an iframe.
 *  href:        null,              // Override the source of the content. Optional in most cases, but required when opening offPage programmatically.
 *  collapsible: false              // Toggles whether offPage can be collapsed or not (think Bootstrap collapsible panel), defaults to false. ONLY WORKS WITH UP/DOWN.
 */

;(function($) {
    // Convenience vars for accessing elements
    var $body, $offPage, $inner, $btnGroup, $closeBtn, $collapseToggle, $collapse, slideHeight, collapseHeight, collapsed;

    $(function() {

        $body = $( 'body' ),
        $offPage = $( '#offPage' ),
        $inner = $( '.op-inner' ),
        $btnGroup = $( '.op-btn-group' ),
        $closeBtn = $( '.op-closebtn' ),
        $collapseToggle = $( '.op-collapse-toggle' );

        // If the offPage element doesn't exist, create it
        if ( $offPage.length === 0 ) {
            $offPage = $( '<div />' ).attr({ 'id': 'offPage', 'class': 'offpage' })
                                     .hide()
                                     .appendTo( $('body') );
        }

        if ( $inner.length === 0 ) {
            $inner = $( '<div />' ).attr({ 'class': 'op-inner' })
                                   .appendTo( $offPage );
        }

        if ($btnGroup.length === 0) {
            $btnGroup = $('<div />').attr({ 'class': 'op-btn-group' })
                                    .prependTo($offPage);
        }

        if ($closeBtn.length === 0) {
            $closeBtn = $('<button><i class="ebsi-icon-remove"></i> Close</button>')
                .attr({ 'class': 'op-closebtn' })
                .appendTo($btnGroup);
        }

        /* -- Events -- */

        // Don't let clicks to the offPage close the window
        $offPage.on( 'click touchend', function ( ev ) {
            ev.stopPropagation();
        });
    
        // Close the offPage if the document is clicked or the users presses the ESC key, unless the offPage is modal
        $( document ).on( 'click keyup touchend', function( ev ) {
            // If this is a keyup event, let's see if it's an ESC key
            if (ev.type === "keyup" && ev.keyCode !== 27) return;

            // Make sure it's visible, and we're not modal      
            if( $offPage.is( ':visible' ) && !$offPage.data( 'modal' ) ) {    
                // allows offPage to be closed and opened cleanly, whether it's collapsed or not
                if ($offPage.data('collapsible')) {
                    $offPage.removeClass('collapsing collapsed');
                }

                $.offPage.close();
            }
        });

        // close button closes offpage... :P
        $closeBtn.on('click touchend', function ( ev ) {
            ev.preventDefault();

            // allows offPage to be closed and opened cleanly, whether it's collapsed or not
            if ($offPage.data('collapsible')) {
                $offPage.removeClass('collapsing collapsed');
            }

            $.offPage.close();
        });
        
    });
    
    var _sliding = false,   // Mutex to assist closing only once
        _lastCaller;        // Used to keep track of last element to trigger offPage

    /*
     * Private methods 
     */
    function _load( url, useIframe, doneCallback ) {
        // Are we loading an element from the page or a URL?
        if ( url.indexOf( "#" ) === 0 ) {          
            $( url ).clone( true ).appendTo( $inner.empty() ).show().show( 'fast', doneCallback );
        } else {
            // Load a URL. Into an iframe?
            if ( useIframe ) {
                var iframe = $( '<iframe />' ).attr({
                                                src: url,
                                                frameborder: 0,
                                                hspace: 0
                                            })
                                            .css({
                                                width: '100%',
                                                height: '100%'
                                            });
                
                $inner.html(iframe);

                if ( typeof doneCallback == 'function' ) {  // make sure the doneCallback is a function
                    doneCallback.call( this );              // brings the scope to the doneCallback
                }
            } else {
                $inner.load( url, doneCallback );
            }
            
            $offPage.data( 'localEl', false );            
        }
    }
    
    // Function that controls opening of the offPage
    function _start( animMethod, direction, speed, easing, callback ) {
        var slideWidth = $offPage.outerWidth(true),
            bodyAnimateIn = {},
            slideAnimateIn = {};

        // If the slide is open or opening, just ignore the call
        if( $offPage.is( ':visible' ) || _sliding ) return;         
        _sliding = true;
                                                                    
        switch( direction ) {
            case 'left':
                $offPage.addClass('hor-left').css({ left: 'auto', right: '-' + slideWidth + 'px' });
                bodyAnimateIn['margin-left'] = '-=' + slideWidth;
                slideAnimateIn['right'] = '+=' + slideWidth;

                break;
            case 'right':
                $offPage.addClass('hor-right').css({ left: '-' + slideWidth + 'px', right: 'auto' });
                bodyAnimateIn['margin-left'] = '+=' + slideWidth;
                slideAnimateIn['left'] = '+=' + slideWidth;

                break;
            case 'up':
                $offPage.addClass('vert-up').css({ bottom: '-' + slideWidth + 'px', top: 'auto' });
                slideHeight = window.getComputedStyle($offPage[0], null).getPropertyValue('height');
                bodyAnimateIn['margin-top'] = '-=' + (slideHeight / 3);
                slideAnimateIn['bottom'] = '+=' + slideWidth;

                break;
            case 'down':
                $offPage.addClass('vert-down').css({ top: '-' + slideWidth + 'px', bottom: 'auto' });
                slideHeight = window.getComputedStyle($offPage[0], null).getPropertyValue('height');
                bodyAnimateIn['margin-top'] = '+=' + (slideHeight / 3.86);
                slideAnimateIn['top'] = '+=' + slideWidth;

                break;
            default:
                $offPage.addClass('hor-left').css({ left: 'auto', right: '-' + slideWidth + 'px' });
                bodyAnimateIn['margin-left'] = '-=' + slideWidth;
                slideAnimateIn['right'] = '+=' + slideWidth;

                break;
        }

        // determine our overflow beforehand
        var overflow = (direction === 'left' || direction === 'right') ? 'overflow-y' : 'overflow-x';
                    
        // Only need to animate the body if using the 'push' animation Method
        if (animMethod === 'push') {
            $body.animate( bodyAnimateIn, speed, easing ).css( overflow, 'hidden' );
        }
        // Animate the slide, and attach this slide's settings to the element
        $offPage.show()
                .animate( slideAnimateIn, speed, easing, function() {
                    _sliding = false;
                }).css({ 'overflow-y': 'auto' });

        $body.css( overflow, 'hidden' );

        // make sure the callback is a function
        if ( typeof callback == 'function' ) {
            callback.call( this ); // brings the scope to the callback
        }
    }

    /**
     * Handles collapse behavior, it's rough
     * TODO - make this better, lol
     */
    function _collapse(settings) {
        // if collapsible is false, just remove elements and exit
        if (!settings.collapsible) {
            // if the Toggle Btn exists already, but we are configured to not use it, then we need to remove it
            if ($('.op-collapse-toggle').length > 0) {
                $('.op-collapse-toggle').remove();
            }

            // same for class on .offpage body
            if ($('.op-collapsible').length > 0) {
                $offPage.removeClass('op-collapsible collapsed collapsing');
            }

            return;
        }

        // first, we need to add collapsible elements
        if ($('.op-collapsible').length === 0) {
            $offPage.addClass('op-collapsible');

            $collapse = $('.op-collapsible');
        }

        // if collapsible is enabled, we need to set collapsed to false
        collapsed = false;

        if ($('.op-collapse-toggle').length === 0) {
            $collapseToggle = $('<button>Collapse</button>')
                .attr({ 'class': 'op-collapse-toggle' })
                .prependTo($btnGroup)
                .on('click touchend',
                    function(e) {
                        e.preventDefault();

                        var transitionEnd =
                            'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';

                        if (collapsed) {
                            $collapse
                                .addClass('collapsing')
                                .removeClass('collapsed')
                                .one(transitionEnd,
                                    function(ev) {
                                        $collapse.removeClass('collapsing');
                                        // return the text to 'Collapse'
                                        $collapseToggle.text('Collapse');
                                    });

                            collapsed = false;
                        } else {
                            $collapse
                                .addClass('collapsing')
                                .one(transitionEnd,
                                    function(ev) {
                                        $collapse.removeClass('collapsing').addClass('collapsed');
                                        // change the text to 'Expand' so its indicative of the action being performed
                                        $collapseToggle.text('Expand');
                                    });

                            collapsed = true;
                        }
                    });
        } else {
            // assign var and reset text if element already exists
            $collapseToggle = $('.op-collapse-toggle').text('Collapse');
        }
    }
      
    /*
     * Declaration 
     */
    $.fn.offPage = function( options, doneCallback ) {
        var $elements = this;
        
        // On click
        $elements.on( 'click', function( ev ) {
            var $self = $( this ),
                settings = $.extend({ href: $self.attr( 'href' ) }, options);

            // Prevent the default behavior and stop propagation
            ev.preventDefault();
            ev.stopPropagation();

            if (settings.collapsible) {
                // if collapsible is enabled, we need to set collapsed to false
                collapsed = false;
            }
            
            if ( $offPage.is( ':visible' ) && $self[0] === _lastCaller ) {
                // If we clicked the same element twice, toggle closed
                $.offPage.close();
            } else {                 
                // Open
                $.offPage( settings, doneCallback );

                // Record the last element to trigger offPage
                _lastCaller = $self[0];
            }       
        });  

    };
    
    /*
     * Default settings 
     */
    $.fn.offPage.defaults = {
        animMethod:  'overlay',         // Accepts 2 options: 'overlay' or 'push', controls how the panel enters the viewport.
        speed:       540,               // Accepts standard jQuery effects speeds (i.e. fast, normal or milliseconds)
        direction:   'left',            // Direction offPage enters from, accepts 'left' or 'right' or 'up' or 'down'.
        easing:      'easeInOutQuad',   // See ui_functions.js Effects -> Easing section for available easing options.
        modal:       false,             // If set to true, you must explicitly close offPage using $.offPage.close();
        iframe:      true,              // By default, linked pages are loaded into an iframe. Set this to false if you don't want an iframe.
        href:        null,              // Override the source of the content. Optional in most cases, but required when opening offPage programmatically.
        collapsible: false              // Toggles whether offPage can be collapsed or not (think Bootstrap collapsible panel), defaults to false. ONLY WORKS WITH UP/DOWN.
    };
    
    /*
     * Public methods 
     */
    
    // Open the offPage
    $.offPage = function( options, doneCallback ) {     
        // Extend the settings with those the user has provided
        var settings = $.extend( {}, $.fn.offPage.defaults, options );

        // run collapse code, enabled/disabled check is in function
        _collapse( settings );
        
        // Are we trying to open in different direction?
        if ( $offPage.is( ':visible' ) && $offPage.data( 'direction' ) !== settings.direction) {
            $.offPage.close(function () {
                _start( settings.animMethod, settings.direction, settings.speed, settings.easing, function() {
                    _load( settings.href, settings.iframe, doneCallback );
                });
            });
        // are we just trying to re-open a new instance?
        } else if ( $offPage.is( ':visible' ) ) {
            $.offPage.close(function () {
                _start( settings.animMethod, settings.direction, settings.speed, settings.easing, function () {
                    _load( settings.href, settings.iframe, doneCallback );
                });
            });
        // else just open it!
        } else {
            if( $offPage.is( ':hidden' ) ) {
                _start( settings.animMethod, settings.direction, settings.speed, settings.easing, function() {
                    _load( settings.href, settings.iframe, doneCallback );
                });
            }
        }
        
        $offPage.data( settings, doneCallback );
    }
    
    // Close the offPage
    $.offPage.close = function( callback ) {
        var $offPage = $( '.offpage' ),
            slideWidth = $offPage.outerWidth(true),
            animMethod = $offPage.data( 'animMethod' ),
            speed = $offPage.data( 'speed' ),
            easing = $offPage.data( 'easing' ),
            bodyAnimateIn = {},
            slideAnimateIn = {};
                        
        // If the slide isn't open, just ignore the call
        if( $offPage.is( ':hidden' ) || _sliding ) return;          
        _sliding = true;
        
        switch( $offPage.data( 'direction' ) ) {
            case 'left':
                bodyAnimateIn['margin-left'] = 0;
                slideAnimateIn['right'] = '-=' + slideWidth;

                break;
            case 'right':
                bodyAnimateIn['margin-left'] = 0;
                slideAnimateIn['left'] = '-=' + slideWidth;

                break;
            case 'up':
                bodyAnimateIn['margin-top'] = 0;
                slideAnimateIn['bottom'] = '-=' + slideWidth;

                break;
            case 'down':
                bodyAnimateIn['margin-top'] = 0;
                slideAnimateIn['top'] = '-=' + slideWidth;

                break;
            default:
                bodyAnimateIn['margin-left'] = 0;
                slideAnimateIn['right'] = '-=' + slideWidth;

                break;
        }

        // determine our overflow beforehand
        var overflow = ($offPage.data('direction') === 'left' || $offPage.data('direction') === 'right') ? 'overflow-y' : 'overflow-x';
        
        // Only need to animate body back into position if using 'push' animation method
        if (animMethod === 'push') {
            $offPage.animate( slideAnimateIn, speed, easing );

            $body.animate( bodyAnimateIn, speed, easing, function () {
                $offPage.hide()
                        .removeClass('hor-left hor-right vert-up vert-down')
                        .removeAttr('style');
                
                _sliding = false;

                if ( typeof callback != 'undefined' ) callback();
            }).css( overflow, 'auto' );
        } else {
            $offPage.animate( slideAnimateIn, speed, easing, function () {
                $offPage.hide()
                        .removeClass('hor-left hor-right vert-up vert-down')
                        .removeAttr('style');

                _sliding = false;

                $body.css( overflow, 'auto' );
                
                if ( typeof callback != 'undefined' ) callback();
            }).css({ 'overflow-y': 'auto' });
        }
    }

})(jQuery);