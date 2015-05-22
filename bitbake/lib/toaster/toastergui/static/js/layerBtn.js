"use strict";

function layerBtnsInit(ctx) {

  /* Remove any current bindings to avoid duplicated binds */
  $(".layerbtn").unbind('click');

  $(".layerbtn").click(function (){
    var layerObj = $(this).data("layer");
    var add = ($(this).data('directive') === "add");
    var thisBtn = $(this);

    libtoaster.addRmLayer(layerObj, add, function (layerDepsList){
      var alertMsg = $("#alert-msg");
      alertMsg.html(libtoaster.makeLayerAddRmAlertMsg(layerObj, layerDepsList, add));

      /* In-cell notification */
      var notification = $('<div id="temp-inline-notify" style="display: none; font-size: 11px; line-height: 1.3;" class="tooltip-inner"></div>');
      thisBtn.parent().append(notification);

      if (add){
        if (layerDepsList.length > 0)
          notification.text(String(layerDepsList.length + 1) + " layers added");
        else
          notification.text("1 layer added");

        var layerBtnsFadeOut = $();
        var layerExistsBtnFadeIn = $();

        layerBtnsFadeOut = layerBtnsFadeOut.add(".layer-add-" + layerObj.id);
        layerExistsBtnFadeIn = layerExistsBtnFadeIn.add(".layer-exists-" + layerObj.id);

        for (var i in layerDepsList){
          layerBtnsFadeOut = layerBtnsFadeOut.add(".layer-add-" + layerDepsList[i].id);
          layerExistsBtnFadeIn = layerExistsBtnFadeIn.add(".layer-exists-" + layerDepsList[i].id);
        }

        layerBtnsFadeOut.fadeOut().promise().done(function(){
          notification.fadeIn().delay(500).fadeOut(function(){
            /* Fade in the buttons */
            layerExistsBtnFadeIn.fadeIn();
            notification.remove();
          });
        });
      } else {
        notification.text("1 layer deleted");
        /* Deleting a layer we only hanlde the one button */
        thisBtn.fadeOut(function(){
          notification.fadeIn().delay(500).fadeOut(function(){
            $(".layer-add-" + layerObj.id).fadeIn();
            notification.remove();
          });
        });
      }

      $("#zone1alerts, #zone1alerts *").fadeIn();
    });
  });

  /* Setup the initial state of the buttons */

  for (var i in ctx.projectLayers){
      $(".layer-exists-" + ctx.projectLayers[i]).show();
      $(".layer-add-" + ctx.projectLayers[i]).hide();
  }
}
