(function(){
	function Vista(div,config){
		HtmlWidget.call(this,div,config);
		this.basicDraw();
	}

	Vista.prototype = Object.create(HtmlWidget.prototype);
	Vista.prototype.constructor = "Vista";
	Vista.prototype.graficos = [
		['trayectorias','posicion','x'],
		['trayectorias','velocidad','x'],
		['trayectorias','aceleracion','x'],
		['motores','angulo','t1'],
		['distanciaTrayectorias',null,'x'],
		['fuerzas',null,'u1'],
		['trayectorias','posicion','y'],
		['trayectorias','velocidad','y'],
		['trayectorias','aceleracion','y'],
		['motores','angulo','t2'],
		['distanciaTrayectorias',null,'y'],
		['fuerzas',null,'u2']
	];

	Vista.prototype.mostrarGraficos = function(res){
		for(var i = 0, params; params = this.graficos[i]; i++){
			var divGrafico = this.getElementsByClassName('graficos')[i]
			var grafico = new Grafico(divGrafico,{});
			grafico.subirData(res,params[0],params[1],params[2]);
			grafico.show(true);
		}

	};

	Vista.prototype.basicDraw = function(){
		var len = this.graficos.length;
		var cantidad = [ ...Array(len/2).keys() ];

		var template = TrimPath.processDOMTemplate('vistas',{
			cantidad : cantidad
		});
		this.d.innerHTML = template;
	};

	window.Vista = Vista;
})();


