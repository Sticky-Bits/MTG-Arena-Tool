var electron = require('electron');
window.ipc = electron.ipcRenderer;
var decks = null;
var matchesHistory = null;
var explore = null;

var mana = {0: "", 1: "white", 2: "blue", 3: "black", 4: "red", 5: "green", 6: "colorless", 7: "", 8: "x"}

ipc_log = function (str, arg) {
    ipc.send('ipc_log', arg);
};

//
setTimeout(function () {
	ipc.send('renderer_state', 1);
}, 1000);

//
ipc.on('set_username', function (event, arg) {
	$('.top_username').html(arg);
});

//
ipc.on('set_rank', function (event, offset, rank) {
	$(".top_rank").css("background-position", (offset*-48)+"px 0px").attr("title", rank);
});

//
ipc.on('set_decks', function (event, arg) {
	setDecks(arg);
});

//
ipc.on('set_history', function (event, arg) {
	setHistory(arg);
});

//
ipc.on('set_history_data', function (event, arg) {
	if (arg != null) {
		matchesHistory = arg;
	}
});

//
ipc.on('set_explore', function (event, arg) {
	setExplore(arg);
});

//
ipc.on('initialize', function (event, arg) {
	$('.sidebar').removeClass('hidden');
	$('.overflow_ux').removeClass('hidden');
	$('.message_center').css('display', 'none');
	//$('.wrapper').css('left', '100%');
});

$(".list_deck").on('mouseenter mouseleave', function(e) {
    $(".deck_tile").trigger(e.type);
});


$(document).ready(function() {
	//
	$(".close").click(function () {
	    ipc.send('window_close', 1);
	});

	//
	$(".minimize").click(function () {
	    ipc.send('window_minimize', 1);
	});

	//
	$(".sidebar_item").click(function () {
		if (!$(this).hasClass("item_selected")) {
			$('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 

			$(".sidebar_item").each(function(index) {
				$(this).removeClass("item_selected");
			});

			$(this).addClass("item_selected");

			if ($(this).hasClass("it0")) {
				setDecks(null);
			}
			if ($(this).hasClass("it1")) {
				$("#ux_0").html('');
				ipc.send('request_history', 1);
			}
			if ($(this).hasClass("it2")) {
				$("#ux_0").html('');
				ipc.send('request_explore', 1);
			}
			if ($(this).hasClass("it3")) {
				open_settings();
			}
			if ($(this).hasClass("it4")) {
				open_about();
			}
		}
	});
});

//
function setHistory(arg) {
	if (arg != null) {
		matchesHistory = arg;
	}

	console.log(matchesHistory);
	sort_history();

	$("#ux_0").html('');
	$("#ux_0").append('<div class="list_fill"></div>');

	matchesHistory.matches.forEach(function(match, index) {
		match = matchesHistory[match];

		var div = $('<div class="'+match.id+' list_match"></div>');


		var fltl = $('<div class="flex_item"></div>');

		var fll = $('<div class="flex_item"></div>');
		fll.css("flex-direction","column");
		var flt = $('<div class="flex_top"></div>');
		var flb = $('<div class="flex_bottom"></div>');
		flt.appendTo(fll); flb.appendTo(fll);

		var flc = $('<div class="flex_item"></div>');
		flc.css("flex-direction","column");
		flc.css("flex-grow", 2);
		fct = $('<div class="flex_top"></div>');
		fcb = $('<div class="flex_bottom"></div>');
		fct.appendTo(flc); fcb.appendTo(flc);

		var flr = $('<div class="flex_item"></div>');

		var tileGrpid = match.playerDeck.deckTileId;
		var tile = $('<div class="'+match.id+'t deck_tile"></div>');
		tile.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(database[tileGrpid].set)+"/"+database[tileGrpid].cid+".jpg)");
		tile.appendTo(fltl);

		var d = $('<div class="list_deck_name">'+match.playerDeck.name+'</div>');
		d.appendTo(flt);
		//match.playerDeck.colors = get_deck_colors(match.playerDeck);

		match.playerDeck.colors.forEach(function(color) {
			$('<div class="mana_20 mana_'+mana[color]+'"></div>').appendTo(flb);
		});

		var d = $('<div class="list_match_title">vs '+match.opponent.name+'</div>');
		d.appendTo(fct);
		var d = $('<div class="list_match_time">'+timeSince(new Date(match.date))+' ago.</div>');
		d.appendTo(fcb);

		if (match.player.win > match.opponent.win) {
			var d = $('<div class="list_match_result_win">Win</div>'); d.appendTo(flr);
		}
		else {
			var d = $('<div class="list_match_result_loss">Loss</div>'); d.appendTo(flr);
		}

		fltl.appendTo(div);
		fll.appendTo(div);
		flc.appendTo(div);
		flr.appendTo(div);
		$("#ux_0").append(div);

		$('.'+match.id).on('mouseenter', function(e) {
		    $('.'+match.id+'t').css('opacity', 1);
		    $('.'+match.id+'t').css('width', '200px');
		});

		$('.'+match.id).on('mouseleave', function(e) {
		    $('.'+match.id+'t').css('opacity', 0.66);
		    $('.'+match.id+'t').css('width', '128px');
		});

		$('.'+match.id).on('click', function(e) {
			open_match(match.id);
		    $('.moving_ux').animate({'left': '-100%'}, 250, 'easeInOutCubic'); 
		});
	});

	$("#ux_0").append('<div class="list_fill"></div>');
}

//
function setDecks(arg) {
	if (arg != null) {
		decks = arg;//JSON.parse(arg);
	}
	sort_decks();
	$("#ux_0").html('');

	$("#ux_0").append('<div class="list_fill"></div>');
	decks.forEach(function(deck, index) {

		var tileGrpid = deck.deckTileId;
		var tile = $('<div class="'+deck.id+'t deck_tile"></div>');
		tile.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(database[tileGrpid].set)+"/"+database[tileGrpid].cid+".jpg)");

		var div = $('<div class="'+deck.id+' list_deck"></div>');

		var fll = $('<div class="flex_item"></div>');
		var flc = $('<div class="flex_item"></div>');
		var flcf = $('<div class="flex_item" style="flex-grow: 2"></div>');
		var flr = $('<div class="flex_item"></div>');
		flc.css("flex-direction","column")

		var flt = $('<div class="flex_top"></div>');
		var flb = $('<div class="flex_bottom"></div>');

		$('<div class="list_deck_name">'+deck.name+'</div>').appendTo(flt);
		deck.colors.forEach(function(color) {
			$('<div class="mana_20 mana_'+mana[color]+'"></div>').appendTo(flb);
		});

		var wr = getDeckWinrate(deck.id);
		if (wr != 0) {
			$('<div class="list_deck_winrate">Winrate: '+wr+'%</div>').appendTo(flr);
		}

		fll.appendTo(div);
		tile.appendTo(fll);

		flc.appendTo(div);
		flcf.appendTo(div);
		flt.appendTo(flc);
		flb.appendTo(flc);
		flr.appendTo(div);
		$("#ux_0").append(div);

		$('.'+deck.id).on('mouseenter', function(e) {
		    $('.'+deck.id+'t').css('opacity', 1);
		    $('.'+deck.id+'t').css('width', '200px');
		});

		$('.'+deck.id).on('mouseleave', function(e) {
		    $('.'+deck.id+'t').css('opacity', 0.66);
		    $('.'+deck.id+'t').css('width', '128px');
		});

		$('.'+deck.id).on('click', function(e) {
			open_deck(index, 0);
		    $('.moving_ux').animate({'left': '-100%'}, 250, 'easeInOutCubic'); 
		});

	});
	$("#ux_0").append('<div class="list_fill"></div>');
}

//
function setExplore(arg) {
	if (arg != null) {
		explore = arg;
	}

	$("#ux_0").html('');
	$("#ux_0").append('<div class="list_fill"></div>');
	explore.forEach(function(_deck, index) {
		deck = _deck.deck;

		var tileGrpid = deck.deckTileId;
		var tile = $('<div class="'+deck.id+'t deck_tile"></div>');
		tile.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(database[tileGrpid].set)+"/"+database[tileGrpid].cid+".jpg)");

		var div = $('<div class="'+deck.id+' list_deck"></div>');

		var fll = $('<div class="flex_item"></div>');
		var flc = $('<div class="flex_item"></div>');
		var flcf = $('<div class="flex_item" style="flex-grow: 2"></div>');
		var flr = $('<div class="flex_item"></div>');
		flc.css("flex-direction","column")

		var flt = $('<div class="flex_top"></div>');
		var flb = $('<div class="flex_bottom"></div>');

		$('<div class="list_deck_name">'+deck.name+'</div>').appendTo(flt);
		$('<div class="list_deck_name_it">by '+_deck.playername+'</div>').appendTo(flt);
		deck.colors = get_deck_colors(deck);
		deck.colors.forEach(function(color) {
			$('<div class="mana_20 mana_'+mana[color]+'"></div>').appendTo(flb);
		});

		$('<div class="list_deck_record">'+_deck.record.CurrentWins+' - '+_deck.record.CurrentLosses+'</div>').appendTo(flr);


		fll.appendTo(div);
		tile.appendTo(fll);

		flc.appendTo(div);
		flcf.appendTo(div);
		flt.appendTo(flc);
		flb.appendTo(flc);
		flr.appendTo(div);
		$("#ux_0").append(div);

		$('.'+deck.id).on('mouseenter', function(e) {
		    $('.'+deck.id+'t').css('opacity', 1);
		    $('.'+deck.id+'t').css('width', '200px');
		});

		$('.'+deck.id).on('mouseleave', function(e) {
		    $('.'+deck.id+'t').css('opacity', 0.66);
		    $('.'+deck.id+'t').css('width', '128px');
		});

		$('.'+deck.id).on('click', function(e) {
			deck.mainDeck.sort(compare_cards);
			deck.sideboard.sort(compare_cards);
			open_deck(index, 1);
		    $('.moving_ux').animate({'left': '-100%'}, 250, 'easeInOutCubic'); 
		});

	});
	$("#ux_0").append('<div class="list_fill"></div>');
}

// 
function open_deck(i, type) {
	if (type == 0) {
		_deck = decks[i];
	}
	if (type == 1) {
		_deck = explore[i].deck;
	}
	$("#ux_1").html('');

	var top = $('<div class="decklist_top"><div class="button back"></div><div class="deck_name">'+_deck.name+'</div></div>');
	flr = $('<div class="flex_item" style="align-self: center;"></div>');

	_deck.colors.forEach(function(color) {
		var m = $('<div class="mana_20 mana_'+mana[color]+'"></div>');
		flr.append(m);
	});
	top.append(flr);


	var tileGrpid = _deck.deckTileId;
	top.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(database[tileGrpid].set)+"/"+database[tileGrpid].cid+".jpg)");
	var fld = $('<div class="flex_item"></div>');

	var dl = $('<div class="decklist"></div>');

	var deck = _deck;
	var prevIndex = 0;
	deck.mainDeck.forEach(function(card) {
		var grpId = card.id;
		var type = database[grpId].type;
		if (prevIndex == 0) {
			addCardSeparator(get_card_type_sort(type), dl);
		}
		else if (prevIndex != 0) {
			if (get_card_type_sort(type) != get_card_type_sort(database[prevIndex].type)) {
				addCardSeparator(get_card_type_sort(type), dl);
			}
		}

		if (card.quantity > 0) {
			addCardTile(grpId, 'a', card.quantity, dl);
		}
		
		prevIndex = grpId;
	});

	dl.appendTo(fld);
	$("#ux_1").append(top);
	$("#ux_1").append(fld);
	//
	$(".back").click(function () {
	    $('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
	});
}

//
function open_match(id) {
	$("#ux_1").html('');
	var match = matchesHistory[id];

	var top = $('<div class="decklist_top"><div class="button back"></div><div class="deck_name">'+match.playerDeck.name+'</div></div>');
	flr = $('<div class="flex_item" style="align-self: center;"></div>');

	match.playerDeck.colors.forEach(function(color) {
		var m = $('<div class="mana_20 mana_'+mana[color]+'"></div>');
		flr.append(m);
	});
	top.append(flr);


	var tileGrpid = match.playerDeck.deckTileId;
	top.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(database[tileGrpid].set)+"/"+database[tileGrpid].cid+".jpg)");
	var fld = $('<div class="flex_item"></div>');

	// this is a mess
	var flt = $('<div class="flex_item"></div>')
	var fltl = $('<div class="flex_item"></div>')
	var r = $('<div class="top_rank"></div>'); r.appendTo(fltl);

	var fltr = $('<div class="flex_item"></div>'); fltr.css("flex-direction","column");
	var fltrt = $('<div class="flex_top"></div>');
	var fltrb = $('<div class="flex_bottom"></div>');
	fltrt.appendTo(fltr); fltrb.appendTo(fltr);

	fltl.appendTo(flt); fltr.appendTo(flt);

	var rank = match.player.rank;
	var tier = match.player.tier;
	r.css("background-position", (get_rank_index(rank, tier)*-48)+"px 0px").attr("title", rank+" "+tier);

	var name = $('<div class="list_match_player_left">'+match.player.name+'</div>');
	name.appendTo(fltrt);

	if (match.player.win > match.opponent.win) {
		var w = $('<div class="list_match_player_left green">Winner</div>');
		w.appendTo(fltrb);
	}

	var dl = $('<div class="decklist"></div>');
	flt.appendTo(dl);

	var deck = match.playerDeck;
	var prevIndex = 0;
	deck.mainDeck.forEach(function(card) {
		var grpId = card.id;
		var type = database[grpId].type;
		if (prevIndex == 0) {
			addCardSeparator(get_card_type_sort(type), dl);
		}
		else if (prevIndex != 0) {
			if (get_card_type_sort(type) != get_card_type_sort(database[prevIndex].type)) {
				addCardSeparator(get_card_type_sort(type), dl);
			}
		}
		if (card.quantity > 0) {
			addCardTile(grpId, 'a', card.quantity, dl);
		}
		
		prevIndex = grpId;
	});

	var flt = $('<div class="flex_item" style="flex-direction: row-reverse;"></div>')
	var fltl = $('<div class="flex_item"></div>')
	var r = $('<div class="top_rank"></div>'); r.appendTo(fltl);

	var fltr = $('<div class="flex_item"></div>'); fltr.css("flex-direction","column"); fltr.css("align-items","flex-end");
	var fltrt = $('<div class="flex_top"></div>');
	var fltrb = $('<div class="flex_bottom"></div>');
	fltrt.appendTo(fltr); fltrb.appendTo(fltr);

	fltl.appendTo(flt);fltr.appendTo(flt);

	var rank = match.opponent.rank;
	var tier = match.opponent.tier;
	r.css("background-position", (get_rank_index(rank, tier)*-48)+"px 0px").attr("title", rank+" "+tier);

	var name = $('<div class="list_match_player_right">'+match.opponent.name+'</div>');
	name.appendTo(fltrt);

	if (match.player.win < match.opponent.win) {
		var w = $('<div class="list_match_player_right green">Winner</div>');
		w.appendTo(fltrb);
	}

	var odl = $('<div class="decklist"></div>');
	flt.appendTo(odl);

	var deck = match.oppDeck;
	var prevIndex = 0;
	deck.mainDeck.forEach(function(card) {
		var grpId = card.id;
		var type = database[grpId].type;
		if (prevIndex == 0) {
			addCardSeparator(get_card_type_sort(type), odl);
		}
		else if (prevIndex != 0) {
			if (get_card_type_sort(type) != get_card_type_sort(database[prevIndex].type)) {
				addCardSeparator(get_card_type_sort(type), odl);
			}
		}
		if (card.quantity > 0) {
			addCardTile(grpId, 'b', card.quantity, odl);
		}
		
		prevIndex = grpId;
	});


	dl.appendTo(fld);
	odl.appendTo(fld);
	$("#ux_1").append(top);
	$("#ux_1").append(fld);
	
	$(".back").click(function () {
	    $('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
	});

}

//
function open_settings() {
}

//
function open_about() {
	$("#ux_0").html('');
	var div = $('<div class="about"><div class="message_big green">MTG Squirrel</div><div class="message_sub white">By Manuel Etchegaray, 2018</div><div class="message_sub white">Version 2.0.0</div></div>');

	$("#ux_0").append(div);
}

//
function getDeckWinrate(deckid) {
	var wins = 0;
	var loss = 0;
	if (matchesHistory == undefined) {
		return 0;
	}
	matchesHistory.matches.forEach(function(match, index) {
		match = matchesHistory[match];
		if (match.playerDeck.id == deckid) {
			if (match.player.win > match.opponent.win) {
				wins++;
			}
			else {
				loss++;
			}
		}
	});

	if (wins == 0) {
		return 0;
	}
	return Math.round((1/(wins+loss)*wins) * 100) / 100
}

//
function sort_decks() {
	decks.sort(compare_decks); 
	decks.forEach(function(deck) {
		deck.colors = [];
		deck.colors = get_deck_colors(deck);
		deck.mainDeck.sort(compare_cards); 
	});
}

//
function compare_decks(a, b) {
	a = Date.parse(a.lastUpdated);
	b = Date.parse(b.lastUpdated);
	if (a < b)	return 1;
	if (a > b)	return -1;
	return 0;
}

//
function sort_history() {
	matchesHistory.matches.sort(compare_matches); 

	matchesHistory.matches.forEach(function(mid) {
		var match = matchesHistory[mid]

		match.playerDeck.colors = get_deck_colors(match.playerDeck);
		match.playerDeck.mainDeck.sort(compare_cards);

		match.oppDeck.colors = get_deck_colors(match.oppDeck);
		match.oppDeck.mainDeck.sort(compare_cards);
	});
}

//
function compare_matches(a, b) {
	a = matchesHistory[a];
	b = matchesHistory[b];
	a = Date.parse(a.date);
	b = Date.parse(b.date);
	if (a < b)	return 1;
	if (a > b)	return -1;
	return 0;
}

