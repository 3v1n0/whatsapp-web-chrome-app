var startup = document.querySelector('#startup');
var spinner = document.querySelector('*.spinner-container');
var appwindow = null;

window.addEventListener('message', function(e) {
  if (!appwindow)
    appwindow = e.source;
});

var observer = new MutationObserver(function(mutationRecords) {
  var favicon = document.querySelector('#favicon');
  for (var m in mutationRecords)
  {
    var target = mutationRecords[m].target;
    if (target == favicon)
    {
      send_initialized();
      break;
    }
    else
    {
      var removed_nodes = Array.prototype.slice.call(mutationRecords[m].removedNodes);
      for (var n in removed_nodes)
      {
        if (removed_nodes[n] == startup || removed_nodes[n] == spinner)
        {
          send_initialized();
          break;
        }
      }
    }
  }
});

observer.observe(document, {subtree: true, attributes: true, childList: true });

function send_initialized()
{
  appwindow.postMessage('initialized', '*');
  observer = null;
}
