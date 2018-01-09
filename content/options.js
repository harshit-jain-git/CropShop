// Saves options to chrome.storage.sync
function save_options(){
  var numberOfTabs = document.getElementById("number-of-tabs").selectedIndex + 1;
  chrome.storage.sync.set({
    numberOfTabs :  numberOfTabs
  }, function(){
     // Update status to let user know options were saved
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get(function(items) {
    document.getElementById("number-of-tabs").selectedIndex = items.numberOfTabs
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);