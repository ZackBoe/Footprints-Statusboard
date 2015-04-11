/* jshint devel:true */
'use strict';

var config = {
	'tick': 1, 	// interval between time checks (minutes)
	'delay': 60, // delay to wait before loading (seconds)
	'dataURI': 'scss.csv' // URL of data to pull in
};

var scssStatus = {
  tickets:{'ap':[],'active':[],'other':[]},
  loadTime: ''
};

document.addEventListener('DOMContentLoaded', function(){
	tick();
	setInterval(tick, config.tick*60000);
});


function tick(){
    var mins = new Date().getMinutes();
    if(mins === '00') setTimeout(load(), config.delay*100);
}

function load(){
	fetch(config.dataURI)  
	  .then(function(response) {  
	    return response.text();
	  })  
	  .then(function(text) {
      scssStatus.loadTime = Date.now();
	  	console.log('got it');
	  	parse(text);
	  })  
	  .catch(function(error) {
	    console.log('Failed to load data: ', error)  
	  });
}

function parse(data){
	scssStatus.tickets={'ap':[],'active':[],'other':[]};
	data = Papa.parse(data.trim(), {'header':true});
	data.data.forEach(function(element){
		switch(element.Status){
			case 'Awaiting Pickup': 
				scssStatus.tickets.ap.push(element);
				break;
			case 'Open':
			case 'Updated':
			case 'Pending':
				scssStatus.tickets.active.push(element);
				break;
			default:
				scssStatus.tickets.other.push(element);
		}
	});
}