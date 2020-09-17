(function(){
	function DiagramaRobot(div,config){

		this.scara = new Scara(undefined,{});

		this.generadorTrayectoria = new GeneradorTrayectoria(undefined,{});

		this.controlPD = new ControlPD();
		this.controlPDPesoPropio = new ControlPDPesoPropio();
		this.controlTorqueComputado = new ControlTorqueComputado();

	}

	DiagramaRobot.prototype.constructor = "DiagramaRobot";

	DiagramaRobot.prototype.tipos = [
		"Real"
	];

	DiagramaRobot.prototype.tipoTrayectorias = [
		"posicion",
		"velocidad",
		"aceleracion"
	];

	DiagramaRobot.prototype.motorTrayectorias = [
		"angulo",
		"velocidadAngular",
		"aceleracionAngular"
	];

	DiagramaRobot.prototype.motorTerminologia = [
		"",
		".",
		".."
	];

	DiagramaRobot.prototype.resultados = {
		trayectorias : {
			posicion : {
				real : []
			},
			velocidad : {
				real : []
			},
			aceleracion : {
				real : []
			}
		},
		motores : {
			angulo : {
				real : []
			},
			velocidadAngular : {
				real : []
			},
			aceleracionAngular : {
				real : []
			}
		},
		fuerzas : {
		},
		distanciaTrayectorias : {
		},
		tiempo : [],
		animacion : {
			theta1 : [],
			theta2 : [],
			tiempoMuestreo : undefined
		}
	}

	DiagramaRobot.prototype.nodoTrayectoria = function(x, y){

		var nodotrayectoria = {
			x : x,
			y : y
		};

		return nodotrayectoria;
	};

	DiagramaRobot.prototype.nodoTheta = function(t1, t2){

		var nodotheta = {
			t1 : t1,
			t2 : t2
		};

		return nodotheta;
	};

	DiagramaRobot.prototype.nodoDistancia = function(xReal, yReal){

		var nodoDistancia = {
			xr : xReal,
			yr : yReal
		};

		return nodoDistancia;
	};

	DiagramaRobot.prototype.nodoFuerza = function(u1, u2){

		var nodofuerza = {
			u1 : u1,
			u2 : u2
		};

		return nodofuerza;
	};

	DiagramaRobot.prototype.getTrayectoria = function(){
		return this.resultados || {};
	};

	DiagramaRobot.prototype.prepararSolver = function(tiempoMuestreo){
		var ecuDiferencial = new odex.Solver(4); //cantidad variables independientes 4
		ecuDiferencial.absoluteTolerance = 0.001;
		ecuDiferencial.relativeTolerance = 0.001;
		ecuDiferencial.maxStepSize = tiempoMuestreo/5;
		ecuDiferencial.initialStepSize = tiempoMuestreo/10;

		return ecuDiferencial;
	};

	DiagramaRobot.prototype.parseoTrayectoria = function(resultado){

		var tiempo = [];
		for(var h = 0, trayectoria; trayectoria = this.tipoTrayectorias[h]; h++){
			for(var j = 0, tipo; tipo = this.tipos[j]; j++){
				tiempo = [];
				for(var i = 0, xi, yi; ((xi = resultado['X'][tipo][i]) != undefined) && ((yi = resultado['Y'][tipo][i]) != undefined); i++){
					this.resultados.trayectorias[trayectoria][tipo.toLowerCase()].push(this.nodoTrayectoria(xi[trayectoria],yi[trayectoria]));
					tiempo.push(xi.tiempo);
				}
			}

			var term = this.motorTerminologia[h];
			var motorTray = this.motorTrayectorias[h];
			for(var i = 0, t1, t2; ((t1 = resultado['motor1'+term][i]) != undefined) && ((t2 = resultado['motor2'+term][i]) != undefined); i++){
				this.resultados.motores[motorTray]['real'].push(this.nodoTheta(t1,t2));
			}
		}

		this.resultados.tiempo = tiempo;

	};

	DiagramaRobot.prototype.calcularDelay = function(thetas){
		var len = thetas.length;

		var cuarto = parseInt(len/4,10);
		var medio = parseInt(len/2,10);
		var tercuarto = parseInt(3*len/4,10);

		var tolerance = 1e-3;

		var xCuarto = this.scara.problemaDirecto(thetas[cuarto][0],thetas[cuarto][1])[0][3];
		var xMedio = this.scara.problemaDirecto(thetas[medio][0],thetas[medio][1])[0][3];
		var xTercuarto = this.scara.problemaDirecto(thetas[tercuarto][0],thetas[tercuarto][1])[0][3];

		var delay = 0;
		for(var i = 0; i < (cuarto-1); i++){
			var distCuarto = math.abs(this.resultados.trayectorias.posicion.real[cuarto-i].x -xCuarto);
			var distMedio = math.abs(this.resultados.trayectorias.posicion.real[medio-i].x - xMedio);
			var distTercuarto = math.abs(this.resultados.trayectorias.posicion.real[tercuarto-i].x - xTercuarto);
			if( distCuarto < tolerance && distMedio < tolerance && distTercuarto < tolerance){
				delay = i;
				break;
			}
		}

		return delay;
	};

	DiagramaRobot.prototype.ordernarThetas = function(thetas, control, motor, carga, tiempoMuestreo){
		var delay = this.calcularDelay(thetas);
		var controlAplicado = "Control"+control;
		var motorUtilizado = "U9D-"+motor;
		thetas.pop(); //siempre me sobra un valor!
		var pri = this.motorTrayectorias[0];
		var sec = this.motorTrayectorias[1];
		var str = controlAplicado+"-"+carga+"-"+motorUtilizado;

		this.resultados.motores[pri][str] = [];
		this.resultados.motores[sec][str] = [];
		this.resultados.trayectorias.posicion[str] = [];
		this.resultados.trayectorias.velocidad[str] = [];
		this.resultados.trayectorias.aceleracion[str] = [];
		this.resultados.distanciaTrayectorias[str] = [];

		var xAnt = undefined;
		var yAnt = undefined;
		var xpAnt = undefined;
		var ypAnt = undefined;

		for(var i = 0, theta; theta = thetas[i]; i++){

			var resMatriz = this.scara.problemaDirecto(theta[0],theta[1]);
			var x = resMatriz[0][3];
			var y = resMatriz[1][3];
			var xp = (x - xAnt)/tiempoMuestreo || 0;
			var yp = (y - yAnt)/tiempoMuestreo || 0;
			var xpp = (xp - xpAnt)/tiempoMuestreo || 0;
			var ypp = (yp - ypAnt)/tiempoMuestreo || 0;

			var nodoTray = this.nodoTrayectoria(x,y);
			var nodoTrayP = this.nodoTrayectoria(xp,yp);
			var nodoTrayPP = this.nodoTrayectoria(xpp,ypp);
			var nodoAngulo = this.nodoTheta(theta[0],theta[1]);
			var nodoVelocidadAngular = this.nodoTheta(theta[2],theta[3]);
			this.resultados.motores[pri][str].push(nodoAngulo);
			this.resultados.motores[sec][str].push(nodoVelocidadAngular);
			this.resultados.trayectorias.posicion[str].push(nodoTray);
			this.resultados.trayectorias.velocidad[str].push(nodoTrayP);
			this.resultados.trayectorias.aceleracion[str].push(nodoTrayPP);

			xpAnt = xp;
			ypAnt = yp;
			xAnt = x;
			yAnt = y;

		}

		for(var i = delay, theta; theta = thetas[i]; i++){

			var resMatriz = this.scara.problemaDirecto(theta[0],theta[1]);
			var x = resMatriz[0][3];
			var y = resMatriz[1][3];

			var realComparar = this.resultados.trayectorias.posicion.real[i-delay];
			var xReal = math.abs(realComparar.x - x);
			var yReal = math.abs(realComparar.y - y);

			var nodoDistancia = this.nodoDistancia(xReal, yReal);
			this.resultados.distanciaTrayectorias[str].push(nodoDistancia);
		}

	};

	DiagramaRobot.prototype.ordernarFuerzas = function(fuerzas, control, motor, carga, km, n){
		var controlAplicado = "Control"+control;
		var motorUtilizado = "U9D-"+motor;
		this.resultados.fuerzas[controlAplicado+"-"+carga+"-"+motorUtilizado] = JSON.parse(JSON.stringify(fuerzas));
		for(var i = 0, fuerza; fuerza = this.resultados.fuerzas[controlAplicado+"-"+carga+"-"+motorUtilizado][i]; i++){
			fuerza.u1*=(km*n);
			fuerza.u2*=(km*n);
		}
	};

	DiagramaRobot.prototype.prepararAnimacion = function(data, thetas){
		this.resultados.animacion.tiempoMuestreo = data.tiempoMuestreo;
		this.resultados.animacion.theta1 = [];
		this.resultados.animacion.theta2 = [];

		for(var i = 0, theta; theta = thetas[i]; i++){
			this.resultados.animacion.theta1.push(theta[0]);
			this.resultados.animacion.theta2.push(theta[1]);
		}
	};

	DiagramaRobot.prototype.posicionInicial = function(){

		var angulo = this.resultados.motores.angulo.real;
		var velocidadAngular = this.resultados.motores.velocidadAngular.real;
		var theta = [
			angulo[0].t1,
			angulo[0].t2,
			velocidadAngular[0].t1,
			velocidadAngular[0].t2
		];

		return theta;
	};

	DiagramaRobot.prototype.ejecutar = function(data){

		var informacionInicio = this.generadorTrayectoria.separacionVariables(data);
		var tiempoTotal = informacionInicio.tiempoTotal;
		this.control = this["control"+data.control];
		this.scara.ponerCarga(data.carga);
		var constantesControl = this.scara.constantesControl(data.motor);

		var cantidad = parseInt(tiempoTotal/data.tiempoMuestreo,10)+1;
//		var tiempos = linspace(0, (tiempoTotal), cantidad);
		var tiempos = linspace(-data.tiempoAceleracion, (tiempoTotal-data.tiempoAceleracion), cantidad);

		var ecuDiferencial = this.prepararSolver(data.tiempoMuestreo); //cantidad variables independientes 4

		var indiceSegmento = 0;
		var resultado = {
			'X' : {
				'Real' : []
			},
			'Y' : {
				'Real': []
			},
			'motor1' : [],
			'motor1.' : [],
			'motor1..' : [],
			'motor2' : [],
			'motor2.' : [],
			'motor2..' : []
		};

		var xAnterior = informacionInicio['X'].posiciones[0].posIni;
		var xAntAux = 0;
		var yAnterior = informacionInicio['Y'].posiciones[0].posIni;
		var yAntAux = 0;
		var corrimientoTiempo = 0;
		var theta1DAnt = undefined;
		var theta2DAnt = undefined;
		var theta1DpAnt = undefined;
		var theta2DpAnt = undefined;
		var thetas = [];
		var res = this.scara.problemaInverso(xAnterior, yAnterior, 0, -1);

		thetas.push([
			res.theta1,
			res.theta2,
			0,
			0
		]);

		var fuerzas = [];

		for(var i = 0, tiempo; (tiempo = tiempos[i]) != undefined; i++){
			var x = informacionInicio['X'].posiciones[indiceSegmento];
			var y = informacionInicio['Y'].posiciones[indiceSegmento];
			if(x == undefined){
				break;
			}
			var tSeg = x.t;
			var resultadosX = this.generadorTrayectoria[data.movimiento](xAnterior, x.posIni, x.posFin, tSeg, tiempo - corrimientoTiempo); //Posion, vel, Acel deseados. MOVEL
			var resultadosY = this.generadorTrayectoria[data.movimiento](yAnterior, y.posIni, y.posFin, tSeg, tiempo - corrimientoTiempo); //Posion, vel, Acel deseados. MOVEL

			if(resultadosX['deseado'] == undefined){
				indiceSegmento++;
				i--;
				xAnterior = xAntAux;
				yAnterior = yAntAux;
				corrimientoTiempo += tSeg;
			} else {
				xAntAux = resultadosX['deseado'];
				yAntAux = resultadosY['deseado'];

				var res = this.scara.problemaInverso(resultadosX['deseado'], resultadosY['deseado'], 0, -1);
				var theta1D = res.theta1;
				var theta2D = res.theta2;
				var theta1pD = (theta1D - theta1DAnt)/data.tiempoMuestreo || 0;
				var theta2pD = (theta2D - theta2DAnt)/data.tiempoMuestreo || 0;
				var theta1ppD = (theta1pD - theta1DpAnt)/data.tiempoMuestreo || 0;
				var theta2ppD = (theta2pD - theta2DpAnt)/data.tiempoMuestreo || 0;

				resultado['X']['Real'].push({
					'posicion' : resultadosX['deseado'],
					'velocidad' : resultadosX['deseado.'],
					'aceleracion' : resultadosX['deseado..'],
					'tiempo' : (tiempo+data.tiempoAceleracion)
				});
				resultado['Y']['Real'].push({
					'posicion' : resultadosY['deseado'],
					'velocidad' : resultadosY['deseado.'],
					'aceleracion' : resultadosY['deseado..'],
					'tiempo' : (tiempo+data.tiempoAceleracion)
				});

				resultado['motor1'].push(theta1D);
				resultado['motor1.'].push(theta1pD);
				resultado['motor1..'].push(theta2ppD);
				resultado['motor2'].push(theta2D);
				resultado['motor2.'].push(theta2pD);
				resultado['motor2..'].push(theta2ppD);

				var control = this.control.accionar(theta1D, theta2D, constantesControl, thetas[i], this.scara.matrizDinamica(), theta1pD, theta2pD, theta1ppD, theta2ppD);
				fuerzas.push(control);
				var nuevaTheta = ecuDiferencial.solve(this.scara.modeloDinamico(data.motor, control), 0, thetas[i], data.tiempoMuestreo).y;
				thetas.push(nuevaTheta);

				theta1DpAnt = theta1pD;
				theta2DpAnt = theta2pD;
				theta1DAnt = theta1D;
				theta2DAnt = theta2D;

			}
		}

		this.parseoTrayectoria(resultado);
		this.ordernarFuerzas(fuerzas, data.control, data.motor, data.carga, constantesControl.km, constantesControl.n);
		this.ordernarThetas(thetas, data.control, data.motor, data.carga, data.tiempoMuestreo);
		this.prepararAnimacion(data, thetas);

	};


	window.DiagramaRobot = DiagramaRobot;
})();
