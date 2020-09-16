(function(){
	/** Clase base de widgets.
	 * Implementa funciones basicas de eventos, etc.
	 * @param d string, undefined o nodo html, si es un string lo busca como id, si es undefined crea un div y si no utiliza el nodo que le pasaron
	 * @param c object (diccionario) o undefined, es lo que se va a setear como this.c
	 */
	function HtmlWidget(d, c){
		this.d = typeof(d) == 'string' ? document.getElementById(d) : ( typeof(d) == 'undefined' ? document.createElement('div') : d);
		this.c = c || {};
		this._events = {};

		if(typeof(this.thisClick) == 'function' && ! this._onClickRegistered){
			this.d.addEventListener('click', this._onClick(), false);
			this._onClickRegistered = true;
		}

		if(typeof(this.thisChange) == 'function' && !this._onChangeRegistered){
			this.d.addEventListener('change', this._onChange(), false);
			this._onChangeRegistered = true;
		}
	}

	HtmlWidget.prototype = {
		constructor: HtmlWidget,
		/** Creador de handler para los eventos de click.
		 * Crea una funcion que se deberia utilizar para manejar los eventos de click, la funcion devuelta ejecuta thisClick.
		 * Arranca con event.target y despues recorre hasta el padre.
		 * Si thisClick devuelve verdadero (o cualquiercosa que se evalue como verdadero) la iteracion se corta.
		 * @return function
		 */
		_onClick: function(){
			var widget = this;
			return function(event){
				for(var t = event.target; t && t != this; t = t.parentNode){
					if(widget.thisClick(event, t, this))
						break;
				}
			};
		},

		/** Metodo que se va a sobreescribir en clases hijas si se quiere manejar los clicks.
		 * @param event evento disparado por html
		 * @param ele elemento actual
		 * @param widget contexto 'this' que disparo el html (es decir, el nodo html donde se puso a escuchar inicialmente, deberia ser this.d)
		 * @return boolean verdadero si se desea cortar la iteracion.
		 */
		thisClick: false /*function(event, ele, widget){}*/,

		/** Booleano que se utiliza para saber si ya se puso a escuchar los clicks.
		 * Se agrego para dar la posibilidad de usar herencia multiple, asi no se se registraban dos veces el evento.
		 */
		_onClickRegistered: false,

		/** Creador de handler para los eventos de change.
		 * Crea una funcion que se deberia utilizar para manejar los eventos de click, la funcion devuelta ejecuta thisChange.
		 * Arranca con event.target y despues recorre hasta el padre.
		 * Si thisClick devuelve verdadero (o cualquiercosa que se evalue como verdadero) la iteracion se corta.
		 * @return function
		 */
		_onChange: function(){
			var widget = this;
			return function(event){
				for(var t = event.target; t && t != this; t = t.parentNode){
					if(widget.thisChange(event, t, this))
						break;
				}
			};
		},

		/** Metodo que se va a sobreescribir en clases hijas si se quiere manejar los clicks.
		 * @param event evento disparado por html
		 * @param ele elemento actual
		 * @param widget contexto 'this' que disparo el html (es decir, el nodo html donde se puso a escuchar inicialmente, deberia ser this.d)
		 * @return boolean verdadero si se desea cortar la iteracion.
		 */
		thisChange: false /*function(event, ele, widget){}*/,

		/** Booleano que se utiliza para saber si ya se puso a escuchar los change.
		 * Se agrego para dar la posibilidad de usar herencia multiple, asi no se se registraban dos veces el evento.
		 */
		_onChangeRegistered: false,

		/** Metodo para buscar nodos html que esten dentro del widget.
		 * Si se pasa una funcion como segundo parametro, se ejecutara la funcion (en el contexto de this de MultiWidget), pasando como unico parametro el nodo encontrado. Si la funcion devuelve true, se parara de iterar, de lo contrario se ejecuta la funcion para todos los elementos encontrados.
		 * @param c: clase
		 * @param f: funcion [opcional]
		 * @return Si no se especifica f, lista de nodos. De lo contrario no devuelve nada.
		 */
		getElementsByClassName: function(c, f){
			var eles = this.d.getElementsByClassName(c);
			if(typeof(f) != "function")
				return eles;

			for(var i=0, e; e = eles[i]; i++){
				if(f.call(this, e))
					break;
			}
		},
		//_events: {}, // Trae problemas, guarda la referencia al objeto, todos comparten la misma referencia

		/** Agrega un callback a que se ejecutara cuando se emita el evento.
		 * Se pueden agregar muchas callbacks para el mismo evento, se ejecutaran todas, secuencialmente en el orden en que se agregaron, cuando se emita el evento.
		 * El contexto 'this' del callback se cambia por el de este objeto, ademas, se le pasa como argumentos la lista de parametros al emitir
		 * @param name [string] nombre del evento
		 * @param funct [function] funcion callback a ejecutar.
		 */
		addEventListener: function(name, funct){
			var list = this._events[name] || [];
			list.push(funct);
			this._events[name] = list;
		},

		/** Remueve un callback de un evento.
		 * Si se pasa el segundo parametro se remueve solo ese callback para ese evento en particular, si se pasa solo el parametro del evento, se remueven todos los callbacks asociados a ese evento.
		 * @param name [string] nombre del evento
		 * @param funct [function] funcion callback
		 */
		removeEventListener: function(name, funct){
			if(this._events[name]){
				if(!funct){
					delete this._events[name];
					return;
				}

				for(var i=0, f; f = this._events[name][i]; i++){
					if(f == funct){
						this._events[name].splice(i, 1);
						return;
					}
				}
			}
		},

		/** Emite un evento.
		 * @param name [string] nombre del evento
		 * @param args [Array] lista de argumentos que se pasan a los callbacks.
		 */
		emit: function(name){
			if(this._events[name]){
				var args = Array.prototype.slice.call(arguments, 1);
				for(var i=0, f; f=this._events[name][i]; i++)
					f.apply(this, args);
			}
		},

		/** Valida un valor de la configuracion (this.c), de no estar bien, se setea el por defecto.
		 * @param name [string] nombre del valor
		 * @param def [var] valor por defecto
		 * @param f [function] (opciona), funcion que recibe un parametro, this.c[name], si devuelve false: this.c[name] = def
		*/
		_cValue: function(name, def, f){
			if((typeof(f) == "function" && !f(this.c[name])) || typeof(this.c[name]) == "undefined")
				this.c[name] = def;
		},

		/** Valida valor de configuracion que sea funcion, de no serlo setea el valor pasado. Si se pasa un valor que no es funcion, se setea un valor de funcion: function(){}.
		 * Llama a HtmlWidget::_cValue.
		 *
		 * @param name [string]
		 * @param def [function]
		 */
		_cValueFunction: function(name, def){
			if(typeof(def) != "function")
				def = function(){}
			return this._cValue(name, def, function(v) { return typeof(v) == "function" ; });
		}
	};

	window.HtmlWidget = HtmlWidget;
})();
