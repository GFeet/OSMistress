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

function imageError(image) {
  var errorImageBase64 = "data:image/jpeg;base64,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";
  osm.hasMissingResources = true;
  $(image).attr("src", errorImageBase64);
}
