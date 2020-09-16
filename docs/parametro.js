(function(){
	function Parametro(div,config){
		HtmlWidget.call(this,div,config);

		this.basicDraw();

		var divSegementos = this.getElementsByClassName('segmento')[0];

		this.segmentos = new Segmento(divSegementos,{
			len : 1,
			indice : 0,
			defecto : JSON.parse(JSON.stringify(this.defecto[0]))
		});

		this.segmentos.addEventListener('quierenAgregar', this.onAgregar.bind(this));
		this.segmentos.addEventListener('mostrar', this.onMostrar.bind(this));
		this.segmentos.addEventListener('quierenCambiarParametro', this.onCambio.bind(this));

//		var divPaginado = this.getElementsByClassName('paginado')[0];
//		this.paginado = new Paginado(divPaginado, {
//			cantidadPaginas : JSON.parse(JSON.stringify(this.defectoGeneral.cantidadSegmentos))
//		});
//		this.paginado.addEventListener('quierenCambiarPagina', this.onCambioPagina.bind(this));

		this.datosSegmentos = JSON.parse(JSON.stringify(this.defecto));
	}

	Parametro.prototype = Object.create(HtmlWidget.prototype);
	Parametro.prototype.constructor = "Parametro";

	Parametro.prototype.defectoGeneral = {
		tiempoMuestreo : 0.0001,
		tiempoAceleracion : 0.1,
		velocidadMotor1 : 1000,
		velocidadMotor2 : 1000
	};

	Parametro.prototype.defecto = [{
		posIni : {
			X : -0.3,
			Y : 0.3,
			Z : 0
		},
		posFin : {
			X : 0.3,
			Y : 0.3,
			Z : 0
		},
		tiempoDeseado : 1
	}];

	Parametro.prototype.nuevo = {
		posIni : {
			X : 0,
			Y : 0,
			Z : 0
		},
		posFin : {
			X : 0,
			Y : 0,
			Z : 0
		},
		tiempoDeseado : 1
	};


	Parametro.prototype.thisChange = function(event,t,that){
		var name = t.getAttribute('data-name');

		if(name == "cantidadSegmentos"){
			var value = parseInt(t.value,10);
			this.defectoGeneral.cantidadSegmentos = value;
//			this.paginado.recargarInfo(value);
		}

		if(name == "pasosGrafico"){
			var value = parseInt(t.value,10);
			this.defectoGeneral.pasosGrafico = value;
		}

		return true;
	};

	Parametro.prototype.thisClick = function(event,t,that){
		var name = t.getAttribute('data-evt');
		switch(name){
			case "calculo":
				this.calculate();
				return true;
				break;
			case "animacion":
				this.animate();
				return true;
				break;
			default:
				return true;
				break;
		}
		return true;
	};

	Parametro.prototype.enableAnimation = function(){
		this.getElementsByClassName('AnimationButton',function(e){
			e.removeAttribute('disabled');
		});
	};

	Parametro.prototype.animate = function(){
		this.emit('animate');
	};

	Parametro.prototype.calculate = function(){
		this.getData();
		this.emit('calcule', JSON.parse(JSON.stringify(this.datos)));
	};

	Parametro.prototype.onCambioPagina = function(desde, hasta){
		this.emit('pagina', desde*this.defectoGeneral.pasosGrafico, hasta*this.defectoGeneral.pasosGrafico);
	};

	Parametro.prototype.onCambio = function(indice, nombre, campo, valor){
		var nuevoValor = parseFloat(valor);
		if(!campo){
			this.datosSegmentos[indice][nombre] = nuevoValor;
		} else {
			this.datosSegmentos[indice][nombre][campo] = nuevoValor;
		}

		if(nombre == 'posFin'){
			var siguiente = this.datosSegmentos[indice+1];
			if(siguiente){
				siguiente.posIni[campo] = nuevoValor;
			}
		}
	};

	Parametro.prototype.onMostrar = function(indice){
		this.segmentos.mostrar(JSON.parse(JSON.stringify(this.datosSegmentos[indice])));
	};

	Parametro.prototype.onAgregar = function(indice){

		var nuevo = JSON.parse(JSON.stringify(this.nuevo));
		var posicionAnterior = this.datosSegmentos[indice].posFin;
		nuevo.posIni = posicionAnterior;
		nuevo.posFin = posicionAnterior;

		this.datosSegmentos.splice((indice+1), 0, (JSON.parse(JSON.stringify(nuevo))));
		this.segmentos.recargarInfo(this.datosSegmentos.length, indice+1);
		this.segmentos.mostrar(JSON.parse(JSON.stringify(this.datosSegmentos[indice+1])));
	};

	Parametro.prototype.getData = function(){

		this.datos = {};

		this.getElementsByClassName('datos', function(ele){
			this.datos[ele.getAttribute('data-name')] = parseFloat(ele.value);
		});

		this.getElementsByClassName('opciones', function(ele){
			if(ele.checked){
				this.datos[ele.getAttribute('name')] = ele.value;
			}
		});

		this.datos.posiciones = this.datosSegmentos;
	};

	Parametro.prototype.basicDraw = function(){
		var template = TrimPath.processDOMTemplate('parametros',JSON.parse(JSON.stringify(this.defectoGeneral)));

		this.d.innerHTML = template;
	};

	window.Parametro = Parametro;
})();
