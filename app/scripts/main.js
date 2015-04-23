/* jshint devel:true */
'use strict';

var config = {
	'tick': 1, 	// interval between time checks (minutes)
	'delay': 60, // delay to wait before loading (seconds)
	'dataURI': 'scss.csv', // URL of data to pull in
  'thresholds': { // thresholds to color count boxes
    'low': 5,
    'med': 10,
    'high': 20,
  }
};

var scssStatus = {
  tickets:{'ap':[],'active':[],'other':[], 'response':[]},
  loadTime: ''
};

var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

document.addEventListener('DOMContentLoaded', function(){
	tick();
  time();
  load();
  setInterval(time, 1000);
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
	  	console.log('Updated Tickets');
	  	parse(text);
	  })  
	  .catch(function(error) {
	    console.log('Failed to load data: ', error)  
	  });
}

function parse(data){
	scssStatus.tickets={'ap':[],'active':[],'other':[], 'response':[]};
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
      case 'Response after Closed':
      case 'User Response':
        scssStatus.tickets.response.push(element);
        break;
			default:
				scssStatus.tickets.other.push(element);
		}
	});
  updateCounts();
}

function updateCounts(){

    if (scssStatus.tickets.active.length > 0){
      var activeTickets = document.createElement('dev');
      document.querySelectorAll('main')[0].insertAdjacentHTML('afterend', ticketListHTML('active'));

      var tickets = document.querySelectorAll('.active .tickets')[0];
      for (var i = scssStatus.tickets.active.length - 1; i >= 0; i--) {
      var ticket = document.createElement('tr');
        ticket.classList.add('ticket');
        ticket.innerHTML = ticketHTML(scssStatus.tickets.active[i]);
        tickets.appendChild(ticket);
      };
    }

    if (scssStatus.tickets.other.length > 0){
      var otherTickets = document.createElement('div');
      document.querySelectorAll('main')[0].insertAdjacentHTML('afterend', ticketListHTML('other'));

      var tickets = document.querySelectorAll('.other .tickets')[0];
      for (var i = scssStatus.tickets.other.length - 1; i >= 0; i--) {
      var ticket = document.createElement('tr');
        ticket.classList.add('ticket');
        ticket.innerHTML = ticketHTML(scssStatus.tickets.other[i]);
        tickets.appendChild(ticket);
      };
    }


    if (scssStatus.tickets.response.length > 0){
      var responseTickets = document.createElement('div');
      document.querySelectorAll('main')[0].insertAdjacentHTML('afterend', ticketListHTML('response'));

      var tickets = document.querySelectorAll('.response .tickets')[0];
      for (var i = scssStatus.tickets.response.length - 1; i >= 0; i--) {
      var ticket = document.createElement('tr');
        ticket.classList.add('ticket');
        ticket.innerHTML = ticketHTML(scssStatus.tickets.response[i]);
        tickets.appendChild(ticket);
      };
    }




    var statusCounts = document.querySelectorAll('.status');
    for (var i = statusCounts.length - 1; i >= 0; i--) {
      var re = /(status-)\w+/;
      var statusType = re.exec(statusCounts[i].className)[0].split('-');

      var count = scssStatus.tickets[statusType[1]].length;
      var background = '', backgroundAccent = '';
      if(count < config.thresholds.low) { 
        background = '#27ae60';
        backgroundAccent = '#2ecc71';
      }
      else if(count > config.thresholds.low && count <= config.thresholds.med) {
        background = '#f39c12';
        backgroundAccent = '#f1c40f';
      }
      else if(count > config.thresholds.med && count <= config.thresholds.high) {
        background = '#d35400'; 
        backgroundAccent = '#e67e22';
      }
      else if(count > config.thresholds.high) {
        background = '#c0392b';
        backgroundAccent = '#e74c3c';
      }
      else { background = ''; }

      var statusBox = document.querySelectorAll('.status-'+statusType[1] + ' .count')[0];
      statusBox.innerHTML = count;
      statusCounts[i].style.background= background;
      statusCounts[i].querySelectorAll('.header')[0].style.borderColor = backgroundAccent;
    };


}

var ticketHTML = function(ticket){
  return '<td class="statusName">'+ticket['Status']+'</td>'+
        ' <td class="id">'+ticket['Ticket Number']+'</td>'+
        ' <td class="age">'+ticket['Date Submitted']+'</td>'+
        ' <td class="le">'+ticket['Last Edit Date']+'</td>'+
        ' <td class="desc">'+ticket['Short Issue Description']+'</td>';
}

var ticketListHTML = function(type){
  return '<div class="box box-list '+type+'">'+
         '<div class="status ticketList status-'+type+'">'+
         '<div class="header">'+type+' tickets</div>'+
         '<span class="count">'+scssStatus.tickets[type].length+'</span></div>'+
         '<table class="tickets"><tr class="ticket"><th class="statusName">Status</th>'+
         '<th class="id">ID</th><th class="age">Submitted</th><th class="le">Last Edit</th>'+
         '<th class="desc">Short Description</th></tr></table></div>';
}

var time = function() {
  var d = new Date();
  document.querySelectorAll('.clock .date')[0].innerHTML = days[d.getDay()] + ', '+ d.getMonth() + '/' + d.getDate();
  document.querySelectorAll('.clock .hours')[0].innerHTML =  d.getHours() > 12 ?  d.getHours()-12: d.getHours();
  document.querySelectorAll('.clock .mins')[0].innerHTML = d.getMinutes();
  document.querySelectorAll('.clock .secs')[0].innerHTML = d.getSeconds() < 10 ? '0'+d.getSeconds() : d.getSeconds();
};
  
