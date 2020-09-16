(function(){
	function Main(div,config){
		HtmlWidget.call(this,div,config);

		this.basicDraw();

		var divParametros = this.getElementsByClassName('parametros')[0];
		this.parametro = new Parametro(divParametros,{});
		this.parametro.addEventListener('calcule',this.onCalc.bind(this));
		this.parametro.addEventListener('animate',this.onAnimation.bind(this));

		var divVista = this.getElementsByClassName('vistas')[0];
		this.vista = new Vista(divVista,{});

		var divAnimacion = this.getElementsByClassName('animacion')[0];
		this.animacion = new Animacion(divAnimacion, {});

		this.diagramaRobot = new DiagramaRobot(undefined,{});

		this.graficos = [];

		this.res = {};
	}

	Main.prototype = Object.create(HtmlWidget.prototype);
	Main.prototype.constructor = "Main";

	Main.prototype.basicDraw = function(){
		var template = TrimPath.processDOMTemplate('mainPage',{});
		this.d.innerHTML = template;
	};

	Main.prototype.onAnimation = function(){

		this.animacion.correr(this.res.animacion);

	};

	Main.prototype.onCalc = function(data){

		this.diagramaRobot.ejecutar(data);

		this.res = this.diagramaRobot.getTrayectoria();
		this.mostrarDatos();
		this.parametro.enableAnimation();

	};

	Main.prototype.mostrarDatos = function(){
		var res = this.res || {};

		this.vista.mostrarGraficos(res);
	};

	window.Main = Main;
})();


