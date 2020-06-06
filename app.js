$(document).ready(async function () {
    const containerId = "ur-container"
    const iframeId = "ur-iframe"
    var uri = getURI(SELECTED_URL)

    if (uri.host.toUpperCase() != location.host.toUpperCase()) {
        window.open(uri.href)
        return
    }

    var article = await getParsedArticle(SELECTED_URL)
    var canRead = article || false

    if (!canRead) {
        window.open(uri.href)
        return
    }

    var container = createContainer()

    if ($('#' + containerId).length == 0) {
        document.querySelector("html").appendChild(container)
        container.appendChild( createIframe())
    }

    addCssIframe()

    $("#" + iframeId).contents().find("body").html(
        getArticleTemplate()
            .replace("{{title}}", article.title)
            .replace("{{contain}}", article.content))


    
    $("#" + containerId)[0].scrollTop = 0;
    
    if( ! new RegExp( uri.host, 'i' ).test( hostShouldKeepScroll().toString() ) ){
      $("html").css("overflow","hidden")   
    }     

    $(getIframe()).find("#ur-close").on("click", closeReader)

    // handle Escape press
    document.onkeydown = getIframe().onkeydown  = function (evt) {
        evt = evt || window.event;
        var isEscape = false;

        if ("key" in evt) {
            isEscape = (evt.key === "Escape" || evt.key === "Esc");
        } else {
            isEscape = (evt.keyCode === 27);
        }

        if (isEscape) {
            closeReader()
        }
    };
    
    window.onclick =  function(){
        if( getIframe() ) closeReader()
    } 

    // handle scroll
    $("#" + containerId).scroll(function () {
        var scrollHeight = $("#" + containerId)[0].scrollHeight;
        $(".ui-resizable-handle").height(scrollHeight)
    });

    $("#" + containerId).resizable({
        handles: 'w',
        create: function (event, ui) {
                     $(".ui-resizable-w").css("cursor", "col-resize");
        },
        start: function(event, ui) {
          $('iframe').css('pointer-events','none');
           },
        stop: function(event, ui) {
          $('iframe').css('pointer-events','auto');
        }
    });
    
    $("#" + containerId).resize(() => doResize())

    doResize()

    function createContainer() {
        var container = document.createElement('div');
        container.id = containerId
        container.style.height = "100%";
        container.style.width = "50%";
        container.style.position = "fixed";
        container.style.top = "0px";
        container.style.right = "0px";
        container.style.zIndex = "9000000000000000000";
        container.style.overflow = "auto";

        $('body').css("background-color") != "rgba(0, 0, 0, 0)" ?
            container.style.backgroundColor = $('body').css("background-color")
            : container.style.backgroundColor = "#fff";

        return container;
    }
    function createIframe() {
        var iframe = document.createElement('iframe');
        iframe.id = iframeId
        iframe.style.height = "100%";
        iframe.style.width = "100%";
        iframe.style.border = "none";
        iframe.style.backgroundColor = "#ffffff";

        return iframe;
    }

    async function getParsedArticle(url) {
        var doc_to_parse = await fetch(url)
            .then(data => data.text())
            .then(text => new DOMParser().parseFromString(text, "text/html"))

        var article = new Readability(getURI(url), doc_to_parse).parse();

        return article;

    }

    function doResize() {
        var readerWidth = $("#" + containerId).outerWidth();
        var htmlWidth = $("html").outerWidth(); 
       
        $("body").css({ width: `${htmlWidth-readerWidth }px` });

        $("#" + containerId).css("left", "")
    }
    function closeReader() {
        $("#" + containerId).remove()

        $("body").css({ width: "100%" });
        $("html").css("overflow","auto")
    }

    function getArticleTemplate() {
        return `
        <span title="Click Or Press 'ESC' To Close." id="ur-close" >×</span>
        <h1>{{title}}</h1>
        <br>
        <div>{{contain}}</div>
        <footer>
            <br>
        </footer>
        `
    }

    function getURI(url) {
        var elUrl = document.createElement('a')
        elUrl.href = url
        var uri = {
            spec: elUrl.href,
            host: elUrl.host,
            prePath: elUrl.protocol + "//" + elUrl.host,
            scheme: elUrl.protocol.substr(0, elUrl.protocol.indexOf(":")),
            pathBase: elUrl.protocol + "//" + elUrl.host + elUrl.pathname.substr(0, elUrl.pathname.lastIndexOf("/") + 1)
        };

        return elUrl
    }
    function addCssIframe(){
        var css = getIframeStyle(),
        head = getIframe().head ,
        style = document.createElement('style');
        head.appendChild(style);
        style.appendChild(document.createTextNode(css));

    }
    function getIframeStyle(){
        return `body {
            font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
            font-size: 16px;
            line-height: 1.5;
            word-wrap: break-word;
            padding: 1.5rem;
          }
          body img {
            margin-top: 1rem;
            max-width: 100%;
           
          }
          
          body footer br{
            margin-top:  1rem ;
            margin-bottom: 1rem;
            /* color:transparent; */
          }
          body :link { color: #0000EE; }
          body :visited { color: #551A8B; }

          #ur-close {
            position: fixed;
            right: 3px;
            top : 3px;
          
            display:inline-block;
            padding:0px 5px;
            background: transparent;
            cursor : pointer;
          }
          `
    }
    function getIframe(){
        if(!frames[iframeId]) return null;

        return frames[iframeId ].contentWindow.document
    }
    function hostShouldKeepScroll(){
        return ['en.wikipedia.org']
    }

});




