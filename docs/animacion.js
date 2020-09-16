(function(){
	function Animacion(div, config){
		HtmlWidget.call(this,div,config);

		this.basicDraw();
	}

	Animacion.prototype = Object.create(HtmlWidget.prototype);
	Animacion.prototype.constructor = "Animacion";

	Animacion.prototype.correr = function(data){
		this.container = this.getElementsByClassName("container3D")[0];
		this.renderer;
		this.camera;
		this.scene;
		this.controls;
		this.barra1;
		this.barra2;
		this.trail1;
		this.trail2;
		this.sphere1;
		this.sphere2;

		this.i = 0;
		this.largo = 0;

		this.theta1Aux = JSON.parse(JSON.stringify(data.theta1)) || [];
		this.theta2Aux = JSON.parse(JSON.stringify(data.theta2)) || [];
		this.theta1 = [];
		this.theta2 = [];
		this.normalizarTiempo(data.tiempoMuestreo);
		this.comienzo();
		this.armarEscena();
		this.dibujado();

	};

	Animacion.prototype.normalizarTiempo = function(tiempoMuestreo){
		var frecuenciaRefresco = 60; //Hz
		var cantidad = math.ceil(1/(frecuenciaRefresco*tiempoMuestreo));

		var valor1 = 0;
		var valor2 = 0;
		var j = 0;

		for(var i = 0, theta1, theta2; ((theta1 = this.theta1Aux[i])!= undefined) && ((theta2 = this.theta2Aux[i])!= undefined); i++){
			valor1 += theta1;
			valor2 += theta2;
			j++;
			if(j == cantidad-1){
				j = 0;
				this.theta1.push(valor1/cantidad);
				this.theta2.push(valor2/cantidad);
				valor1 = 0;
				valor2 = 0;
		}
		}
		this.largo = this.theta1.length;
	};

	Animacion.prototype.comienzo = function(){

		// configuración básica de Three.js
		this.renderer = new THREE.WebGLRenderer({
			antialias : true
		});

		var renderWidth = 1280;
		var renderHeight = 720;
		this.renderer.setSize(renderWidth, renderHeight);
		this.renderer.setClearColor(0xFFFFFF);

		var aspect = renderWidth/renderHeight;

		this.camera = new THREE.PerspectiveCamera( 65, aspect, 1, 1000);
		this.camera.position.set(200, 50, 0);
		this.camera.lookAt(new THREE.Vector3(0,0,0));

		this.scene = new THREE.Scene();
		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		this.controls.target.y = 50;
		this.controls.update();
		this.controls.screenSpacePanning = true;
		this.container.append(this.renderer.domElement);

		// Defino elementos de la escena

		var ambienLight = new THREE.AmbientLight(0x666666);
		this.scene.add(ambienLight);

		var light1 = new THREE.PointLight(0xFFFFFF, 1);
		light1.position.set(500.0,1000.0,0.0);
		this.scene.add(light1);

		var gridHelper = new THREE.GridHelper( 1500,600 );
		gridHelper.rotation.x = math.pi/2;
		gridHelper.rotation.z = math.pi/2;
		this.scene.add( gridHelper );

		var axesHelper = new THREE.AxesHelper( 8 );
		this.scene.add( axesHelper );

	};


	Animacion.prototype.armarEscena = function(){


		var esc = 3;
		var geometry = new THREE.BoxGeometry( 5*esc, 40*esc, 5*esc );
		var material = new THREE.MeshPhongMaterial( {color: 0xCCCC00} );
		geometry.translate(0,20*esc,0);

		this.sphere1 = new THREE.Mesh( new THREE.SphereGeometry( 5*esc, 32*esc, 32*esc ), new THREE.MeshPhongMaterial( {color: 0xff0000} ) );
		this.sphere1.position.y = 40*esc;

		this.barra1 = new THREE.Mesh( geometry, material );
		this.barra1.position.y = 0;
		this.barra1.add( this.sphere1 );

		var geometry2 = new THREE.BoxGeometry( 5*esc, 30*esc, 5*esc );
		material2 = new THREE.MeshPhongMaterial( {color: 0x00FFFF} );
		geometry2.translate(0,15*esc,0);

		this.barra2 = new THREE.Mesh( geometry2, material2 );
		this.barra2.position.y = 40*esc;

		this.sphere2 = new THREE.Mesh( new THREE.SphereGeometry( 5*esc, 32*esc, 32*esc ), new THREE.MeshPhongMaterial( {color: 0xff0000} ) );
		this.sphere2.position.y = 30*esc;
		this.barra2.add( this.sphere2 );

		this.barra1.add(this.barra2)
		this.scene.add(this.barra1);

		var axesHelper = new THREE.AxesHelper( 8 );
		this.barra1.add( axesHelper );

		axesHelper = new THREE.AxesHelper( 8 );
		this.barra2.add( axesHelper );

		this.trail1 = new Trail(1000,new THREE.Vector3(0,0,0),0.0, this.scene);
		this.trail2 = new Trail(100000,new THREE.Vector3(0,0,0),0.0, this.scene);
	}

	Animacion.prototype.dibujado = function() {

		if(this.i > this.largo - 1){
//			requestAnimationFrame(function(){});
			requestAnimationFrame(this.dibujado.bind(this));

			this.renderer.render(this.scene, this.camera,false,false);

		} else {
			requestAnimationFrame(this.dibujado.bind(this));

			this.barra1.rotation.x = this.theta1[this.i] - math.pi/2;
			this.barra2.rotation.x = this.theta2[this.i];

			this.trail1.pushPosition(this.sphere1.getWorldPosition(new THREE.Vector3(0,0,0)));
			this.trail2.pushPosition(this.sphere2.getWorldPosition(new THREE.Vector3(0,0,0)));

			this.i++;
			this.renderer.render(this.scene, this.camera,false,false);

		}
	}

	Animacion.prototype.basicDraw = function(){
		var template = TrimPath.processDOMTemplate('animacion',{});

		this.d.innerHTML = template;
	};


	window.Animacion = Animacion;
})();
