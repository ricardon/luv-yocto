"use strict";
/* All shared functionality to go in libtoaster object.
 * This object really just helps readability since we can then have
 * a traceable namespace.
 */
var libtoaster = (function (){

  /* makeTypeahead parameters
   * elementSelector: JQuery elementSelector string
   * xhrUrl: the url to get the JSON from expects JSON in the form:
   *  { "list": [ { "name": "test", "detail" : "a test thing"  }, .... ] }
   * xhrParams: the data/parameters to pass to the getJSON url e.g.
   *  { 'type' : 'projects' } the text typed will be passed as 'value'.
   *  selectedCB: function to call once an item has been selected one
   *  arg of the item.
   */
  function _makeTypeahead (jQElement, xhrParams, selectedCB) {

    jQElement.typeahead({
        source: function(query, process){
          xhrParams.value = query;
          $.getJSON(libtoaster.ctx.xhrDataTypeaheadUrl, this.options.xhrParams, function(data){
            if (data.error !== "ok") {
              console.log("Error getting data from server "+data.error);
              return;
            }

            return process (data.list);
          });
        },
        updater: function(item) {
          var itemObj = this.$menu.find('.active').data('itemObject');
          selectedCB(itemObj);
          return item;
        },
        matcher: function(item) {  return ~item.name.toLowerCase().indexOf(this.query.toLowerCase()); },
        highlighter: function (item) {
          if (item.hasOwnProperty('detail'))
            /* Use jquery to escape the value as text into a span */
            return $('<span></span>').text(item.name+' '+item.detail).get(0);
          return $('<span></span>').text(item.name).get(0);
        },
        sorter: function (items) { return items; },
        xhrUrl: libtoaster.ctx.xhrDataTypeaheadUrl,
        xhrParams: xhrParams,
    });


    /* Copy of bootstrap's render func but sets selectedObject value */
    function customRenderFunc (items) {
      var that = this;

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', item.name).data('itemObject', item);
        i.find('a').html(that.highlighter(item));
        return i[0];
      });

      items.first().addClass('active');
      this.$menu.html(items);
      return this;
    }

    jQElement.data('typeahead').render = customRenderFunc;
  }

  /*
   * url - the url of the xhr build */
  function _startABuild (url, project_id, targets, onsuccess, onfail) {

    var data = {
      project_id : project_id,
      targets : targets,
    }

    $.ajax( {
        type: "POST",
        url: url,
        data: data,
        headers: { 'X-CSRFToken' : $.cookie('csrftoken')},
        success: function (_data) {
          if (_data.error !== "ok") {
            console.warn(_data.error);
          } else {
            if (onsuccess !== undefined) onsuccess(_data);
          }
        },
        error: function (_data) {
          console.warn("Call failed");
          console.warn(_data);
          if (onfail) onfail(data);
    } });
  }

  /* cancelABuild:
   * url: xhr_projectbuild
   * builds_ids: space separated list of build request ids
   * onsuccess: callback for successful execution
   * onfail: callback for failed execution
   */
  function _cancelABuild(url, build_ids, onsuccess, onfail){
    $.ajax( {
        type: "POST",
        url: url,
        data: { 'buildCancel': build_ids },
        headers: { 'X-CSRFToken' : $.cookie('csrftoken')},
        success: function (_data) {
          if (_data.error !== "ok") {
            console.warn(_data.error);
          } else {
            if (onsuccess !== undefined) onsuccess(_data);
          }
        },
        error: function (_data) {
          console.warn("Call failed");
          console.warn(_data);
          if (onfail) onfail(_data);
        }
    });
  }

  /* Get a project's configuration info */
  function _getProjectInfo(url, projectId, onsuccess, onfail){
    $.ajax({
        type: "POST",
        url: url,
        data: { project_id : projectId },
        headers: { 'X-CSRFToken' : $.cookie('csrftoken')},
        success: function (_data) {
          if (_data.error !== "ok") {
            console.warn(_data.error);
          } else {
            if (onsuccess !== undefined) onsuccess(_data);
          }
        },
        error: function (_data) {
          console.warn(_data);
          if (onfail) onfail(_data);
        }
    });
  }

  /* Properties for data can be:
   * layerDel (csv)
   * layerAdd (csv)
   * projectName
   * projectVersion
   * machineName
   */
  function _editCurrentProject(data, onSuccess, onFail){
    $.ajax({
        type: "POST",
        url: libtoaster.ctx.xhrProjectEditUrl,
        data: data,
        headers: { 'X-CSRFToken' : $.cookie('csrftoken')},
        success: function (data) {
          if (data.error != "ok") {
            console.log(data.error);
            if (onFail !== undefined)
              onFail(data);
          } else {
            if (onSuccess !== undefined)
              onSuccess(data);
          }
        },
        error: function (data) {
          console.log("Call failed");
          console.log(data);
        }
    });
  }

  function _getLayerDepsForProject(projectId, layerId, onSuccess, onFail){
    /* Check for dependencies not in the current project */
    $.getJSON(libtoaster.ctx.xhrDataTypeaheadUrl,
      { type: 'layerdeps', 'value': layerId , project_id: projectId },
      function(data) {
        if (data.error != "ok") {
          console.log(data.error);
          if (onFail !== undefined)
            onFail(data);
        } else {
          onSuccess(data);
        }
      }, function() {
        console.log("E: Failed to make request");
    });
  }

  /* parses the query string of the current window.location to an object */
  function _parseUrlParams() {
    var string = window.location.search;
    string = string.substr(1);
    var stringArray = string.split ("&");
    var obj = {};

    for (var i in stringArray) {
      var keyVal = stringArray[i].split ("=");
      obj[keyVal[0]] = keyVal[1];
    }

    return obj;
  }

  /* takes a flat object and outputs it as a query string
   * e.g. the output of dumpsUrlParams
   */
  function _dumpsUrlParams(obj) {
    var str = "?";

    for (var key in obj){
      if (!obj[key])
        continue;

      str += key+ "="+obj[key].toString();
      str += "&";
    }

    return str;
  }

  function _addRmLayer(layerObj, add, doneCb){
    if (add === true) {
      /* If adding get the deps for this layer */
      libtoaster.getLayerDepsForProject(libtoaster.ctx.projectId,
        layerObj.id,
        function (layers) {

        /* got result for dependencies */
        if (layers.list.length === 0){
          var editData = { layerAdd : layerObj.id };
          libtoaster.editCurrentProject(editData, function() {
            doneCb([]);
          });
          return;
        } else {
          try {
            showLayerDepsModal(layerObj, layers.list, null, null,  true, doneCb);
          }  catch (e) {
            $.getScript(libtoaster.ctx.jsUrl + "layerDepsModal.js", function(){
              showLayerDepsModal(layerObj, layers.list, null, null,  true, doneCb);
            }, function(){
              console.warn("Failed to load layerDepsModal");
            });
          }
        }
      }, null);
    } else if (add === false) {
      var editData = { layerDel : layerObj.id };

      libtoaster.editCurrentProject(editData, function () {
        doneCb([]);
      }, function () {
        console.warn ("Removing layer from project failed");
        doneCb(null);
      });
    }
  }

  function _makeLayerAddRmAlertMsg(layer, layerDepsList, add) {
    var alertMsg;

    if (layerDepsList.length > 0 && add === true) {
      alertMsg = $("<span>You have added <strong>"+(layerDepsList.length+1)+"</strong> layers to <a id=\"project-affected-name\"></a>: <a id=\"layer-affected-name\"></a> and its dependencies </span>");

      /* Build the layer deps list */
      layerDepsList.map(function(layer, i){
        var link = $("<a></a>");

        link.attr("href", layer.layerdetailurl);
        link.text(layer.name);
        link.tooltip({title: layer.tooltip});

        if (i !== 0)
          alertMsg.append(", ");

        alertMsg.append(link);
      });
    } else if (layerDepsList.length === 0 && add === true) {
      alertMsg = $("<span>You have added <strong>1</strong> layer to <a id=\"project-affected-name\"></a>: <a id=\"layer-affected-name\"></a></span></span>");
    } else if (add === false) {
      alertMsg = $("<span>You have deleted <strong>1</strong> layer from <a id=\"project-affected-name\"></a>: <a id=\"layer-affected-name\"></a></span>");
    }

    alertMsg.children("#layer-affected-name").text(layer.name);
    alertMsg.children("#layer-affected-name").attr("href", layer.url);
    alertMsg.children("#project-affected-name").text(libtoaster.ctx.projectName);
    alertMsg.children("#project-affected-name").attr("href", libtoaster.ctx.projectPageUrl);

    return alertMsg.html();
  }


  return {
    reload_params : reload_params,
    startABuild : _startABuild,
    cancelABuild : _cancelABuild,
    makeTypeahead : _makeTypeahead,
    getProjectInfo: _getProjectInfo,
    getLayerDepsForProject : _getLayerDepsForProject,
    editCurrentProject : _editCurrentProject,
    debug: false,
    parseUrlParams : _parseUrlParams,
    dumpsUrlParams : _dumpsUrlParams,
    addRmLayer : _addRmLayer,
    makeLayerAddRmAlertMsg : _makeLayerAddRmAlertMsg,
  };
})();

/* keep this in the global scope for compatability */
function reload_params(params) {
    var uri = window.location.href;
    var splitlist = uri.split("?");
    var url = splitlist[0];
    var parameters = splitlist[1];
    // deserialize the call parameters
    var cparams = [];
    if(parameters)
      cparams = parameters.split("&");

    var nparams = {};
    for (var i = 0; i < cparams.length; i++) {
        var temp = cparams[i].split("=");
        nparams[temp[0]] = temp[1];
    }
    // update parameter values
    for (i in params) {
        nparams[encodeURIComponent(i)] = encodeURIComponent(params[i]);
    }
    // serialize the structure
    var callparams = [];
    for (i in nparams) {
        callparams.push(i+"="+nparams[i]);
    }
    window.location.href = url+"?"+callparams.join('&');
}


/* Things that happen for all pages */
$(document).ready(function() {

  /* If we don't have a console object which might be the case in some
     * browsers, no-op it to avoid undefined errors.
     */
    if (!window.console) {
      window.console = {};
      window.console.warn = function() {};
      window.console.error = function() {};
    }

    /*
     * PrettyPrint plugin.
     *
     */
    // Init
    prettyPrint();

    // Prevent invalid links from jumping page scroll
    $('a[href=#]').click(function() {
        return false;
    });


    /* START TODO Delete this section now redundant */
    /* Belen's additions */

    // turn Edit columns dropdown into a multiselect menu
    $('.dropdown-menu input, .dropdown-menu label').click(function(e) {
        e.stopPropagation();
    });

    // enable popovers in any table cells that contain an anchor with the
    // .btn class applied, and make sure popovers work on click, are mutually
    // exclusive and they close when your click outside their area

    $('html').click(function(){
        $('td > a.btn').popover('hide');
    });

    $('td > a.btn').popover({
        html:true,
        placement:'left',
        container:'body',
        trigger:'manual'
    }).click(function(e){
        $('td > a.btn').not(this).popover('hide');
        // ideally we would use 'toggle' here
        // but it seems buggy in our Bootstrap version
        $(this).popover('show');
        e.stopPropagation();
    });

    // enable tooltips for applied filters
    $('th a.btn-primary').tooltip({container:'body', html:true, placement:'bottom', delay:{hide:1500}});

    // hide applied filter tooltip when you click on the filter button
    $('th a.btn-primary').click(function () {
        $('.tooltip').hide();
    });

    // enable help information tooltip
    $(".get-help").tooltip({container:'body', html:true, delay:{show:300}});

    // show help bubble only on hover inside tables
    $(".hover-help").css("visibility","hidden");
    $("th, td").hover(function () {
        $(this).find(".hover-help").css("visibility","visible");
    });
    $("th, td").mouseleave(function () {
        $(this).find(".hover-help").css("visibility","hidden");
    });

    /* END TODO Delete this section now redundant */

    // show task type and outcome in task details pages
    $(".task-info").tooltip({ container: 'body', html: true, delay: {show: 200}, placement: 'right' });

    // initialise the tooltips for the icon-pencil icons
    $(".icon-pencil").tooltip({ container: 'body', html: true, delay: {show: 400}, title: "Change" });

    // initialise the tooltips for the download icons
    $(".icon-download-alt").tooltip({ container: 'body', html: true, delay: { show: 200 } });

    // initialise popover for debug information
    $(".icon-info-sign").popover( { placement: 'bottom', html: true, container: 'body' });

    // linking directly to tabs
    $(function(){
          var hash = window.location.hash;
          $('ul.nav a[href="' + hash + '"]').tab('show');

          $('.nav-tabs a').click(function () {
            $(this).tab('show');
            $('body').scrollTop();
          });
    });

    // toggle for long content (variables, python stack trace, etc)
    $('.full, .full-hide').hide();
    $('.full-show').click(function(){
        $('.full').slideDown(function(){
            $('.full-hide').show();
        });
        $(this).hide();
    });
    $('.full-hide').click(function(){
        $(this).hide();
        $('.full').slideUp(function(){
            $('.full-show').show();
        });
    });

    //toggle the errors and warnings sections
    $('.show-errors').click(function() {
        $('#collapse-errors').addClass('in');
    });
    $('.toggle-errors').click(function() {
        $('#collapse-errors').toggleClass('in');
    });
    $('.show-warnings').click(function() {
        $('#collapse-warnings').addClass('in');
    });
    $('.toggle-warnings').click(function() {
        $('#collapse-warnings').toggleClass('in');
    });
    $('.show-exceptions').click(function() {
        $('#collapse-exceptions').addClass('in');
    });
    $('.toggle-exceptions').click(function() {
        $('#collapse-exceptions').toggleClass('in');
    });


    $("#hide-alert").click(function(){
      $(this).parent().fadeOut();
    });

    //show warnings section when requested from the previous page
    if (location.href.search('#warnings') > -1) {
        $('#collapse-warnings').addClass('in');
    }

    function check_for_duplicate_ids () {
      /* warn about duplicate element ids */
      var ids = {};
      $("[id]").each(function() {
        if (this.id && ids[this.id]) {
          console.warn('Duplicate element id #'+this.id);
        }
        ids[this.id] = true;
      });
    }

    if (libtoaster.debug) {
      check_for_duplicate_ids();
    } else {
      /* Debug is false so supress warnings by overriding the functions */
      window.console.warn = function () {};
      window.console.error = function () {};
   }
});
