window.onresize = reLayout;

function getWebView()
{
  if (!getWebView.view)
    getWebView.view = document.querySelector('webview');

  return getWebView.view;
}

onload = function()
{
  var webview = getWebView();
  reLayout();

  webview.addEventListener('permissionrequest', function(e) {
    if (e.permission === 'media' || e.permission === 'geolocation') {
      e.request.allow();
    }
  });

  webview.style.webkitTransition = 'opacity 250ms';
  webview.addEventListener('unresponsive', function() {
    webview.style.opacity = '0.5';
  });
  webview.addEventListener('responsive', function() {
    webview.style.opacity = '1';
  });

  webview.addEventListener('loadstart', handleLoadStart);
  webview.addEventListener('loadstop', setupRepaintWorkaround);

  webview.addEventListener('newwindow', function(e) {
    e.stopImmediatePropagation();
    window.open(e.targetUrl);
  });
};

function reLayout()
{
  var webview = getWebView();
  webview.style.width = document.documentElement.clientWidth + 'px';
  webview.style.height = document.documentElement.clientHeight + 'px';
}

function handleLoadStart(e)
{
  if (e.isTopLevel)
  {
    var parser = document.createElement('a');
    parser.href = e.url;

    if (parser.hostname.match(/^(.*\.)?whatsapp.[^.]*$/i) === null)
    {
      e.stopImmediatePropagation();
      getWebView().stop();
      window.open(e.url);
    }
  }
}

function setupRepaintWorkaround()
{
  /* This is an ugly workaround that unfortunately is needed in order to
   * make the webview to repaint as soon as the whatsapp web client has been
   * loaded. Without this, the view is not shown until something happens.
   *
   * So, basically we setup a mutation observer on the view that notifies
   * us when the whatsapp initialization is done, while we show/hide a dummy div
   */

  var webview = getWebView();

  window.addEventListener('message', function(e) {
    if (e.data === 'initialized')
    {
      window.setTimeout(function() {
        var workaround_div = document.querySelector('#dummy-workaround');
        workaround_div.style.display = 'block';

        window.setTimeout(function() {
          workaround_div.style.display = 'none';
        }, 2000);
      }, 1000);
    }
  });

  var loader = new XMLHttpRequest();
  loader.open('GET', 'injected.js');
  loader.onload = function() {
    webview.executeScript({ code: this.responseText }, function(res) {
      webview.contentWindow.postMessage('setup', '*');
    });
  }
  loader.send();
}
