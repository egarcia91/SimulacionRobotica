(function(){
	function ControlPDPesoPropio(){
	}

	ControlPDPesoPropio.prototype.constructor = "ControlPDPesoPropio";
	ControlPDPesoPropio.prototype.constanteProporcional = 0;
	ControlPDPesoPropio.prototype.constanteDerivativa = 0;
	ControlPDPesoPropio.prototype.toleranciaMotorMaxima = 0;

	ControlPDPesoPropio.prototype.accionar = function(thetaDeseado1, thetaDeseado2, constantes, theta, matrizDinamica){


		var kp = constantes.kp;
		var kd = constantes.kd;
		var km = constantes.km;
		var n = constantes.n;
		this.toleranciaMotorMaxima = constantes.tauMax;

		var thetaD1 = thetaDeseado1;
		var thetaD2 = thetaDeseado2;

		this.constanteProporcional = kp;
		this.constanteDerivativa = kd;

		var kp1 = kp["1"];
		var kp2 = kp["2"];

		var kd1 = kd["1"];
		var kd2 = kd["2"];


		var theta1 = theta[0];
		var theta2 = theta[1];
		var thetap1 = theta[2];
		var thetap2 = theta[3];

		var parametrosDinamicos = matrizDinamica(theta1, theta2, thetap1, thetap2);

		var u1 = kp1*(thetaD1-theta1)-kd1*thetap1 + parametrosDinamicos.vecG[0]/(n*km);
		var u2 = kp2*(thetaD2-theta2)-kd2*thetap2 + parametrosDinamicos.vecG[1]/(n*km);

		var toleranciaMotor1 = km*u1;
		var toleranciaMotor2 = km*u2;

		if(this.saturaMorot(toleranciaMotor1)){
			u1 = math.sign(u1)*this.toleranciaMotorMaxima/km;
		}

		if(this.saturaMorot(toleranciaMotor2)){
			u2 = math.sign(u2)*this.toleranciaMotorMaxima/km;
		}

		return {
			u1 : u1,
			u2 : u2
		}
	};

	ControlPDPesoPropio.prototype.saturaMorot = function(toleranciaMotor){

		var seSatura = false;

		if(math.abs(toleranciaMotor) > this.toleranciaMotorMaxima){
			seSatura = true;
		}

		return seSatura;
	};

	window.ControlPDPesoPropio = ControlPDPesoPropio;
})();
