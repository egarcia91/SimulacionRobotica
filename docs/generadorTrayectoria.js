(function(){
	function GeneradorTrayectoria(div,config){

		this.tiempoAceleracion = 0;
	}

	GeneradorTrayectoria.prototype.constructor = "GeneradorTrayectoria";

	GeneradorTrayectoria.prototype.ejesCartesianos = [
		"X",
		"Y"
	];

	GeneradorTrayectoria.prototype.separacionVariables = function(data){
		this.tiempoAceleracion = data.tiempoAceleracion;
		var vMax = data.velocidadMotor1;
		var apartado = {};
		var tiempoTotal = data.tiempoAceleracion;

		for(var j = 0, ejeCartesiano; ejeCartesiano = this.ejesCartesianos[j]; j++){
			apartado[ejeCartesiano] = {
				posiciones : [],
				tiempoAceleracion : data.tiempoAceleracion
			};
		}

		for(var i = 0, ele; ele = data.posiciones[i]; i++){
			var tiempos = {};

			for(var j = 0, ejeCartesiano; ejeCartesiano = this.ejesCartesianos[j]; j++){
				apartado[ejeCartesiano].posiciones.push({
					posFin : ele.posFin[ejeCartesiano],
					posIni : ele.posIni[ejeCartesiano],
					t : 0
				});
				tiempos[ejeCartesiano] = math.abs(ele.posFin[ejeCartesiano] - ele.posIni[ejeCartesiano])/vMax;

			}

			var tiempoSegmento = math.max(tiempos.X, tiempos.Y, data.tiempoAceleracion, ele.tiempoDeseado);
			tiempoTotal += tiempoSegmento;

			for(var j = 0, ejeCartesiano; ejeCartesiano = this.ejesCartesianos[j]; j++){
				apartado[ejeCartesiano].posiciones[i].t = tiempoSegmento;
				apartado[ejeCartesiano].posiciones[i].vel = (ele.posFin[ejeCartesiano] - ele.posIni[ejeCartesiano])/tiempoSegmento;
			}
		}

		apartado.tiempoTotal = tiempoTotal;

		return apartado;
	};

	GeneradorTrayectoria.prototype.moveL = function(pA, pB, pC, tiempoSegmento, tiempo){

		var dA = pA - pB;
		var dC = pC - pB;
		var tiempoA = this.tiempoAceleracion;

		var tAux = tiempo+tiempoA;
		var tAux2 = tiempo-tiempoA;

		var pD = 0;
		var pDp = 0;
		var pDpp = 0;

		if (tiempo <= tiempoA && tiempo >= -tiempoA){
			pD = (dC/tiempoSegmento)*(tAux*tAux)/(4*tiempoA)+(dA/tiempoA)*(tAux2*tAux2)/(4*tiempoA) + pB;
			pDp = dC*( tAux/(2*tiempoA))/tiempoSegmento + dA*(tAux2/(2*tiempoA))/tiempoA;
			pDpp = (dC/tiempoSegmento + dA/tiempoA) / (2*tiempoA);
		} else if(tiempo <= tiempoSegmento - tiempoA) {
			pD = (dC/tiempoSegmento)*tiempo + pB;
			pDp = dC/tiempoSegmento;
			pDpp = 0;
		} else {
			pD = undefined;
		}

		return {
			'deseado' : pD,
			'deseado.' : pDp,
			'deseado..' : pDpp
		};
	};

	window.GeneradorTrayectoria = GeneradorTrayectoria;
})();
