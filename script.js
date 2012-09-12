	var options = {
		series: {
			lines:  { show:true},
			points: { show:true, radius: 2.4},
			highlightColor: "#70B070"
		},
		
		xaxis: {
			min: 0,
			max: 50,
			ticks: 10,
			tickDecimals: 0
		},
		
		yaxis: {
			min: 0,
			max: 20
		},
		
		grid: {
			show: true,
			markings: [ {yaxis: {from: 0, to: 4.79}, lineWidth: 1, color: "#F9ADA9"},
			            {yaxis: {from: 4.79, to: 4.88}, lineWidth: 1, color: "#D2FF9B"},
						{yaxis: {from: 4.88, to: 9.58}, lineWidth: 1, color: "#77CDE5"}
			],
			hoverable: true,
			clickable: true,
			autoHighlight: true
		},
		
		colors: ["#404040"]
	}
	
	function showTooltip(x, y, contents) {
        $('<div id="tooltip">' + contents + '</div>').css( {
            position: 'absolute',
            display: 'none',
            top: y + 5,
            left: x + 5,
            border: '1px solid #fdd',
            padding: '2px',
            'background-color': '#fee',
            opacity: 0.80
        }).appendTo("body").fadeIn(200);
    }
	
	function startSimulatePrecise() {
		var k = parseInt($("input[name=Kills]").val());
		var d = parseInt($("input[name=Deaths]").val());
		var a = parseInt($("input[name=Assists]").val());
		var nbAct = parseInt($("input[name=Actions]").val());
		var nbSim = parseInt($("input[name=Simulations]").val());
		var result = simulate(nbAct, nbSim, k, d, a);
		
		var text = "Average <b>" + result + "</b> stacks after " + nbAct + " actions.";
		$("#result").html(text);
	}
	
	function simulateGeneral(){
		$("#loading").html("Simulating...");
		setTimeout("startSimulateGeneral();", 1);
	}
	
	function startSimulateGeneral() {
		var k = parseInt($("input[name=Kills]").val());
		var d = parseInt($("input[name=Deaths]").val());
		var a = parseInt($("input[name=Assists]").val());
		
		if (isNaN(k)){k=0;}
		if (isNaN(d)){d=0;}
		if (isNaN(a)){a=0;}
		
		var nbSim = parseInt($("input[name=Simulations]").val());
		var upTo = 50;
		var columns = 5;
		var lines = Math.ceil(upTo/columns);
		var result = simulateEach(++upTo, nbSim, k, d, a);
		
		var text = "<table id='res'><tr><th colspan='"+ 2*columns +"'>Result</th></tr><tr>";
		// Première ligne
		for (var col = 0; col < columns; col++) {
			text += "<th>#</th><th>Stacks</th>";
		}
		text += "</tr>";
		
		// lignes suivantes
		for (var line = 0; line < lines; line++){
			text += "<tr>";
			for (var col = 0; col < columns; col++) {
				text += "<td>" + (col*lines + line + 1) + "</td><td>" + result[col*lines + line + 1] + "</td>";
			}
			text += "</tr>";
		}

		text += "</table>";
		$("#result").html(text);
		
		var data = new Array(upTo);
		for (var i = 0; i < upTo; i++){
			data[i] = [i, result[i]];
		}
		$("#loading").html("");
		$.plot($("#placeholder") , [data], options);
	}
		
	function kill(stacks) {
		return Math.min(stacks+2, 20);
	}
	
	function death(stacks) {
		return Math.round(stacks*2/3);
	}
	
	function assist(stacks) {
		return Math.min(stacks+1, 20);
	}
	
	function action(stacks, kRatio, dRatio, aRatio) {
		var total = kRatio + dRatio + aRatio; // Calcule le total de cas K+D+A
		var random = Math.floor(Math.random()*total); // Génère un nombre aléatoire entre 0 et le total
		if (random < kRatio) { // Si le nombre est entre 0 et kRatio -> Kill
			return kill(stacks);
		}
		if (kRatio <= random && random < kRatio+dRatio) { // Si le nombre est entre kRatio et kRatio+dRatio -> Death
			return death(stacks);
		}
		return assist(stacks); // Dans tous les autres cas, il s'agit d'un Assist.
	}
	
	function simulate(nbActions, nbSimulations, kRatio, dRatio, aRatio) {
		var result = 0;
		for (var sim = 0; sim < nbSimulations; sim++) { // À chaque simulation
			var stacks = 0; // On démarre avec 0 stacks
			for (var act = 0; act < nbActions; act++) { // Puis on effectue autant d'actions que demandées
				stacks = action(stacks, kRatio, dRatio, aRatio);
			}
			result += stacks; // On ajoute le # stacks au résultat précédent
		}
		return Math.round(result/nbSimulations*1000)/1000 // On fait la moyenne
	}
	
	function simulateEach(nbActions, nbSimulations, kRatio, dRatio, aRatio) {
		var result = new Array(nbActions);
		for (var i = 0; i < nbActions; i++) {
			result[i] = 0; // On fait la moyenne à chaque action
		}
		for (var sim = 0; sim < nbSimulations; sim++) { // À chaque simulation
			var stacks = 0; // On démarre avec 0 stacks
			for (var act = 1; act < nbActions; act++) { // Puis on effectue autant d'actions que demandées
				stacks = action(stacks, kRatio, dRatio, aRatio);
				result[act] += stacks; // On ajoute le # stacks au résultat précédent
			}
		}
		for (var i = 0; i < nbActions; i++) {
			result[i] = Math.round(result[i]/nbSimulations*1000)/1000; // On fait la moyenne à chaque action
		}
		return result;
	}
	
	function simulateUpTo(nbActionsTotal, nbSimulations, kRatio, dRatio, aRatio) {
		var result = new Array(nbActionsTotal);
		for (var i = 0; i < nbActionsTotal; i++){
			result[i] = simulate(i, nbSimulations, kRatio, dRatio, aRatio);
		}
		return result;
	}