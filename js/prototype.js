$(document).ready(function () {
  osm = {"mods": []};
  loadDefaultData();
  registerMods();
  loadMods();
});

function loadDefaultData() {
  $.getJSON("data/default-data.json", function (data) {
    gameData = data;
  }).done(function() {
    onDataLoaded();
  });
}

function onDataLoaded() {
  addItemCards();
}

function addItemCards() {
  $.each( gameData.items, function( index, item ) {
    createItemCard(item);
  });
}

function createItemCard(item) {
  instantiateTemplate("#my-template", "#my-container");
  let $cloneImg = $("#my-template-clone > .item-icon");
  $cloneImg.attr("src", item.imageURL);
  $cloneImg.attr("alt", item.title);
  $("#my-template-clone > div > .card-title").text(item.title);
  $("#my-template-clone > div > .card-text").text(item.description);
  
  let owner = getCharacterReferenceById(item.ownerId);
  let itemStatus = "<b>Status: </b> Being worn by <a href=\"#\">" + owner.name + "</a>.";
  $("#my-template-clone > ul > .status").html(itemStatus);

  $("#my-template-clone").attr("id", "item-" + item.id + "-card");
}

function instantiateTemplate( templateSelector, parentSelector ) {
  var temp = $(templateSelector);
  var cont = $(parentSelector);

  cont.append(temp.clone().html());
}

function getCharacterReferenceById(id) {
  for ( charIndex in gameData.characters ) {
    let currentCharacter = gameData.characters[charIndex];
    if(currentCharacter.id === id) {
      return currentCharacter;
    }
  }
  return null;
}

function getPossessiveNameForm(name) {
  if( name[name.length - 1] == "s" ) {
    return name + "'";
  } else {
    return name + "'s";
  }
}

// ------------------------------------------------------------
// LOAD OR REFRESH MISTRESS STATUS
// ------------------------------------------------------------
function renderMistressCard(id) {
  let mistress = getCharacterReferenceById(id);
  if(mistress === null) return;

  let foundMeter = $( "#meter-" + id + "-wrapper" );
  let foundCard = $( "#mistress-" + id + "-card" );

  if ( foundMeter.length ) {
    foundMeter.remove();
  }

  if ( foundCard.length ) {
    foundCard.remove();
  }

  instantiateTemplate("#mistress-card", "#mistress-card-wrapper");
  let $cloneImg = $("#mistress-card-clone > .card-img-top");
  $cloneImg.attr("src", mistress.avatarURL);
  $cloneImg.attr("alt", "Mistress " + mistress.name);

  let newCardId = "mistress-" + mistress.id + "-card";
  let $clone = $("#mistress-card-clone");
  $clone.attr("id", newCardId);

  $("#meter-wrapper-clone").attr("id", "meter-" + mistress.id + "-wrapper");

  let eventPayload = {
    selector: "#" + newCardId,
    jqElement: $clone,
    mistress: mistress
  };

  triggerModsCallbackWithPayload("onMistressCardCreated", eventPayload);
}

// ------------------------------------------------------------
// MODDING
// ------------------------------------------------------------

function registerMods() {
  let myFirstMod = {
    name: "MyFirstMod",
    onLoaded: function() {
      console.log("MyModLoaded - " + this.name);
    },
    onMistressCardCreated: function(cardId) {
      console.log("Mod reacts to element being created: " + cardId);
    }
  };

  osm.mods.push(myFirstMod);

  registerMistressMeters();
}

function loadMods() {
  triggerModsCallback("onLoaded");
}

function triggerModsCallback(callbackName) {
  osm.mods.forEach(function(mod) {
    if(mod.hasOwnProperty(callbackName) && isFunction(mod[callbackName])) {
      mod[callbackName]();
    }
  });
}

function triggerModsCallbackWithPayload(callbackName, payload) {
  osm.mods.forEach(function(mod) {
    if(mod.hasOwnProperty(callbackName) && isFunction(mod[callbackName])) {
      mod[callbackName](payload);
    }
  });
}

function isFunction(object) {
  return typeof object == "function";
}

// ------------------------------------------------------------
// [MOD] - MISTRESS METERS
// ------------------------------------------------------------
function registerMistressMeters() {
  let mistressMeters = {
    name: "Mistress Meters",
    author: "GFeet",
    description: "A simple mod adding meter functionality to mistress cards.",
    onLoaded: function() {
      console.log("[" + this.name + "] - Loaded");
    },
    onMistressCardCreated: function(cardPayload) {
      addMetersToCard(cardPayload);
    }
  };

  osm.mods.push(mistressMeters);
}

function addMetersToCard(cardPayload) {
  cardPayload.mistress.meters.forEach(function (meter){
    instantiateTemplate("#mistress-meter", "#meter-" + cardPayload.mistress.id + "-wrapper > .list-group");

    $("#mistress-meter-clone > .text-center").text(meter.name);
    $("#mistress-meter-clone > .progress > .progress-bar").attr("style", "width: " + meter.value  + "%");
    $("#mistress-meter-clone > .progress > .progress-bar").attr("aria-valuenow", meter.value);
    
    let newCardId = "mistress-" + meter.name + "-meter";
    let $clone = $("#mistress-meter-clone");
    $clone.attr("id", newCardId);
  });
}

// ------------------------------------------------------------
// IMAGE PROCESSING
// ------------------------------------------------------------
function toDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.send();
}

// contentType is usually "text/plain"
function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}
