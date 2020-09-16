(function(){
	function ControlTorqueComputado(){
	}

	ControlTorqueComputado.prototype.constructor = "ControlTorqueComputado";
	ControlTorqueComputado.prototype.constanteProporcional = 0;
	ControlTorqueComputado.prototype.constanteDerivativa = 0;
	ControlTorqueComputado.prototype.toleranciaMotorMaxima = 0;

	ControlTorqueComputado.prototype.accionar = function(thetaDeseado1, thetaDeseado2, constantes, theta, matrizDinamica, thetaD1p, thetaD2p, thetaD1pp, thetaD2pp){

		var km = constantes.km;
		var n = constantes.n;
		var wn = constantes.wn;
		this.toleranciaMotorMaxima = constantes.tauMax;

		var thetaD1 = thetaDeseado1;
		var thetaD2 = thetaDeseado2;

		var kp1 = wn*wn;
		var kp2 = wn*wn;

		var kd1 = 2*wn;
		var kd2 = 2*wn;

		var theta1 = theta[0];
		var theta2 = theta[1];
		var thetap1 = theta[2];
		var thetap2 = theta[3];


		var u1 = kp1*(thetaD1-theta1)+kd1*(thetaD1p - thetap1) + thetaD1pp;
		var u2 = kp2*(thetaD2-theta2)+kd2*(thetaD2p - thetap2) + thetaD2pp;

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

	ControlTorqueComputado.prototype.saturaMorot = function(toleranciaMotor){

		var seSatura = false;

		if(math.abs(toleranciaMotor) > this.toleranciaMotorMaxima){
			seSatura = true;
		}

		return seSatura;
	};

	window.ControlTorqueComputado = ControlTorqueComputado;
})();
