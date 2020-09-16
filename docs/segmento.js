(function(){
	function Segmento(div,config){
		HtmlWidget.call(this,div,config);

		this.cantidadSegmentos = this.c.len;
		this.indexSegmentos = this.c.indice;
		this.cooldown = false;
		this.mostrar(this.c.defecto);
	}

	Segmento.prototype = Object.create(HtmlWidget.prototype);
	Segmento.prototype.constructor = "Segmento";

	Segmento.prototype.thisClick = function(event,t,that){
		var name = t.getAttribute('data-evt');
		switch(name){

			case "siguiente":
				this.drawSig();
				return true;
				break;

			case "anterior":
				this.drawAnt();
				return true;
				break;

			case "agregar":
				this.agregar(t);
				return true;
				break;

			case "eliminar":
				return true;
				break;
			default:
				return true;
				break;
		}
		return true;
	};

	Segmento.prototype.thisChange = function(event,t,that){
		var name = t.getAttribute('data-name');
		var campo = t.getAttribute('data-campo');
		this.emit('quierenCambiarParametro', this.indexSegmentos, name, campo, t.value);
		return true;
	};

	Segmento.prototype.recargarInfo = function(len, indice){
		this.cantidadSegmentos = len;
		this.indexSegmentos = indice;
	};

	Segmento.prototype.agregar = function(){
		this.emit("quierenAgregar", this.indexSegmentos);
	};

	Segmento.prototype.drawAnt = function(){
		this.indexSegmentos--; 
		this.draw(this.indexSegmentos);
	};

	Segmento.prototype.drawSig = function(){
		this.indexSegmentos++;
		this.draw(this.indexSegmentos);
	};

	Segmento.prototype.draw = function(indice){
		this.emit("mostrar", indice);
	};

	Segmento.prototype.mostrar = function(datos){
		var haySiguiente = ((this.cantidadSegmentos-1) != this.indexSegmentos);
		var hayAnterior = (this.indexSegmentos != 0);
		var bloquearPosIni = hayAnterior;

		var template = TrimPath.processDOMTemplate('segmentos',{
			datos : datos,
			seg : this.indexSegmentos,
			haySig : haySiguiente,
			hayAnt : hayAnterior,
			bloqPosI : bloquearPosIni
		});

		this.d.innerHTML = template;
	};

	window.Segmento = Segmento;
})();


