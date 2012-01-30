var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem) 
      this.elem = document.getElementById('wki-infolog');
    this.elem.innerHTML = text;
    //    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};


function init(nodeid){
//		alert(nodeid);

  var state = $("#wki-infoswitch option:selected").val();
//	alert(state);
	var url = Drupal.settings.basePath + "jit/json/" + state + "/" + encodeURIComponent(nodeid).replace(/%2F/g, "/"); //"http://wisski.gnm.de/dev/jit/json/" + nodeid;
  $.getJSON(url, function(json) {
		json = JSON.parse(json);

    //init RGraph
    var rgraph = new $jit.RGraph({
        //Where to append the visualization
        injectInto: 'wki-infovis',
        // Optional: create a background canvas that plots
        // concentric circles.
        background: {
          CanvasStyles: {
            strokeStyle: 'rgb(208,208,208)'
          },
          // Distance of concentric circles
          levelDistance: 80   
        },
        // Distance of nodes
        levelDistance: 80,
        //Add navigation capabilities:
        //zooming by scrolling and panning.
        Navigation: {
          enable: true,
          panning: true,
          zooming: 20
        },
        //Set Node and Edge styles.
        Node: {
            color: 'rgb(195,79,9)',
            dim: 6
        },
        
        Edge: {
            color: 'rgb(195,79,9)',
            lineWidth: 0.5
        },

        onBeforeCompute: function(node){
            Log.write("centering " + node.name + "...");

//    $jit.id('wki-infolist').innerHTML = node.data.relation;
            
        },
        
        onAfterCompute: function(){
            Log.write("done");
        },
        //Add the name of the node in the correponding label
        //and a click handler to move the graph.
        //This method is called once, on label creation.
        onCreateLabel: function(domElement, node){
            domElement.innerHTML = node.name;
            domElement.ondblclick = function() {
							window.location.href = node.id;
            };
            domElement.onclick = function(){
//								alert("click" + node.name);

					          $.ajaxSetup({
					  "error":function() {
			rgraph.onClick(node.id);
}});

					var uri = node.id;
					//var elem = uri.split("/");
					//var url = "http://wisski.gnm.de/dev/jit/json/" + elem[elem.length -1];
					var state = $("#wki-infoswitch option:selected").val();
					//var url = Drupal.settings.basePath + "jit/json/" + state + "/" + encodeURIComponent(elem[elem.length -1]);
					var url = Drupal.settings.basePath + "jit/json/" + state + "/" + encodeURIComponent(uri).replace(/%2F/g, "/");					

//					alert(url);
					//alert(JSON.stringify(node));
					var my_JSON_object = {};
				  $.getJSON(url, function(jsonstring) {
//						alert("alert");
//						alert(jsonstring);
				    json = JSON.parse(jsonstring);

						//load JSON data
//    				rgraph.loadJSON(json);

						rgraph.op.sum(json, {
							                    type:"fade",
                        duration:250,
                        fps: 25,
                        hideLabels: false,
                        transition: $jit.Trans.Quart.easeOut 
							});

//						rgraph.refresh(true);
    				//end
   			 		//append information about the root relations in the right column
						rgraph.graph.getNode(rgraph.root).data.relation = json.data.relation;
						
				    $jit.id('wki-infolist').innerHTML = rgraph.graph.getNode(rgraph.root).data.relation;
//							$jit.id('wki-infolist').innerHTML = json.data.relation;							


                rgraph.onClick(node.id);
						});
            };

        },
        //Change some label dom properties.
        //This method is called each time a label is plotted.
        onPlaceLabel: function(domElement, node){
            var style = domElement.style;
            style.display = '';
            style.cursor = 'pointer';
            /*
            if (node._depth <= 1) {
                style.fontSize = "0.8em";
                style.color = "rgb(64,64,64)";
            
            } else if(node._depth == 2){
                style.fontSize = "0.8em";
                style.color = "rgb(128,128,128)";
            
            } else {
                //style.display = 'none';
                style.fontSize = "0.8em";
                style.color = "rgb(192,192,192)";
            }
	    */

	    style.fontSize = "0.8em";
	    style.color = "rgb(192,192,192)";


            var left = parseInt(style.left);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2) + 'px';
        },
      
        //Add tooltips  
        Tips: {  
            enable: true,  
            onShow: function(tip, node) {  
                var html = "<div class=\"tip-title\">" + node.id + "</div>";   
                var data = node.data;  
                if("days" in data) {  
                    html += "<b>Last modified:</b> " + data.days + " days ago";  
                }  
                if("size" in data) {  
                    html += "<br /><b>File size:</b> " + Math.round(data.size / 1024) + "KB";  
                }  
                tip.innerHTML = html;  
            }  
        }
    });
		
	$("#wki-infoswitch").change(function() {
	//		alert("waaaah!");

    var uri = rgraph.graph.getNode(rgraph.root).id;
//    var elem = uri.split("/");

		var state = $("#wki-infoswitch option:selected").val();
		var url = Drupal.settings.basePath + "jit/json/" + state + "/" + encodeURIComponent(uri).replace(/%2F/g, "/");
					
					//alert(url);
					//alert(JSON.stringify(node));
					var my_JSON_object = {};
				  $.getJSON(url, function(jsonstring) {
//						alert("alert");
//						alert(jsonstring);
				    json = JSON.parse(jsonstring);

						//load JSON data
    				rgraph.loadJSON(json);

				    //trigger small animation
    rgraph.graph.eachNode(function(n) {
      var pos = n.getPos();
      //pos.setc(-200, -200);
      pos.setc(0,0);
    });
    rgraph.compute('end');
    rgraph.fx.animate({
      modes:['polar'],
      duration: 1600
    });
    //end
    //append information about the root relations in the right column
		rgraph.graph.getNode(rgraph.root).data.relation = json.data.relation;
    $jit.id('wki-infolist').innerHTML = rgraph.graph.getNode(rgraph.root).data.relation;
//		$jit.id('wki-infolist').innerHTML = json.data.relation;		
});
	});

    //load JSON data
    rgraph.loadJSON(json);
    //trigger small animation
    rgraph.graph.eachNode(function(n) {
      var pos = n.getPos();
      //pos.setc(-200, -200);
      pos.setc(0,0);
    });
    rgraph.compute('end');
    rgraph.fx.animate({
      modes:['polar'],
      duration: 1600
    });
    //end
    //append information about the root relations in the right column
    $jit.id('wki-infolist').innerHTML = rgraph.graph.getNode(rgraph.root).data.relation;
	});

//	$("#wki-infoswitch").change(function() {
//		alert("waaaah!");
//		var meineid = "bla";
//		alert(meineid);		
//alert(" bla " + rgraph.graph.getNode(rgraph.root).id);
//  	alert("alles doof!");	
//	init(rgraph.graph.getNode(rgraph.root).id);
//	});
}
