
(function ( $, window, undefined ) {

    $( function () {

        var $container    = $( '#fluxus-customize' );
        var $btnToggle    = $( '#fluxus-customize-toggle' );

        $btnToggle.click( function () {

            if ( $container.is( '.opened' ) ) {
                // open
                $container.removeClass( 'opened' );
            } else {
                // close
                $container.addClass( 'opened' );
            }

            return false;
        });

        $container.find( '.set-stylesheet' ).click( function () {

            var $t = $( this );
            if ( $t.is( '.active' ) ) {
                return false;
            }

            var $control = $t.closest( '.customizer-control' );
            var uri = $control.data( 'uri' );
            var $previouslyActive = $control.find( '.active' ).removeClass( 'active' );

            $t.addClass( 'active' );

            var $previousStylesheet = $( 'link[href^="' + uri + $previouslyActive.data( 'value' ) + '"]' );

            if ( $previousStylesheet.length ) {
                $previousStylesheet[0].disabled = true;
            }

            var $newStylesheet = $( 'link[href^="' + uri + $t.data( 'value' ) + '"]' );
            if ( $newStylesheet.length ) {
                $newStylesheet[0].disabled = false;
            } else {
                if ( document.createStyleSheet ) {
                    // IE case
                    try {
                        document.createStyleSheet( $t.data( 'value' ) );
                    } catch (e) { }
                } else {
                    $('<link type="text/css" rel="stylesheet" href="' + uri + $t.data( 'value' ) + '" />').
                          appendTo($('head'));
                }
            }

            docCookies.setItem( $control.attr( 'id' ), $t.data( 'value' ), 60*60, '/' );

            return false;

        });

        $('.password-protected-project .widget-password form').each(function () {

          var $t = $(this),
              $p = $('<p />').html('PS. Password is "demo"').css({
                clear: 'both',
                padding: '10px 0 0 0'
              });
          $t.append($p);

        });

    });

    /**
     * A complete cookies reader/writer framework with full unicode support.
     * https://developer.mozilla.org/en-US/docs/DOM/document.cookie
     * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
     * docCookies.getItem(name)
     * docCookies.removeItem(name[, path])
     * docCookies.hasItem(name)
     * docCookies.keys()
     */
    var docCookies = {
      getItem: function (sKey) {
        if (!sKey || !this.hasItem(sKey)) { return null; }
        return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
      },
      setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return; }
        var sExpires = "";
        if (vEnd) {
          switch (vEnd.constructor) {
            case Number:
              sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
              break;
            case String:
              sExpires = "; expires=" + vEnd;
              break;
            case Date:
              sExpires = "; expires=" + vEnd.toGMTString();
              break;
          }
        }
        document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
      },
      removeItem: function (sKey, sPath) {
        if (!sKey || !this.hasItem(sKey)) { return; }
        document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
      },
      hasItem: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
      },
      keys: /* optional method: you can safely remove it! */ function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = unescape(aKeys[nIdx]); }
        return aKeys;
      }
    };

})( jQuery, window );