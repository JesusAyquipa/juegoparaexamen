var juego = new Phaser.Game(370, 550, Phaser.CANVAS, 'bloque_juego');
var fondoJuego;
var persona;
var sonidoFondo;
var estrella;
var textoNivel;
var nivelActual = 1;
var audioIniciado = false;
var rocas;
var numeroRocas = 2;
var gameOver = false;
var teclaDerecha, teclaIzquierda, teclaArriba, teclaAbajo;

var estadoPortada = {
    preload: function () {
        juego.load.image('fondo', 'montaña.jpg');
    },
    create: function () {
        var fondo = juego.add.tileSprite(0, 0, 370, 550, 'fondo');

        var titulo = juego.add.text(juego.width / 2, 180, "ESPACIO GALACTICO", {
            font: "bold 28px Arial",
            fill: "#6527F5",
            stroke: "#8B4513",
            strokeThickness: 5
        });
        titulo.anchor.set(0.5);

        var nombre = juego.add.text(juego.width / 2, 230, "Por: Jesus Ayquipa", {
            font: "bold 20px Arial",
            fill: "#FFFFFF",
            stroke: "#2773F5",
            strokeThickness: 4
        });
        nombre.anchor.set(0.5);

        var boton = juego.add.text(juego.width / 2, 320, "BIENVENIDO ASTRONAUTA", {
            font: "bold 22px Arial",
            fill: "#2773F5",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            padding: 10,
            align: "center",
            stroke: "#2773F5",
            strokeThickness: 3
        });
        boton.anchor.set(0.5);
        boton.inputEnabled = true;

        // animación del botón (efecto parpadeo)
        juego.add.tween(boton).to({ alpha: 0.5 }, 800, Phaser.Easing.Cubic.InOut, true, 0, -1, true);

        boton.events.onInputDown.add(function () {
            // transición con un pequeño efecto
            var fade = juego.add.graphics(0, 0);
            fade.beginFill(0x000000, 1);
            fade.drawRect(0, 0, juego.width, juego.height);
            fade.endFill();
            fade.alpha = 0;

            var tween = juego.add.tween(fade).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
            tween.onComplete.add(function () {
                juego.state.start('principal');
            });
        });
    }
};
var estadoPrincipal = {
    preload: function (){
        juego.load.image('fondo', 'montaña.jpg');
        juego.load.spritesheet('personas','persona.png',64,64);
        juego.load.audio('sonido','audio2.mp3');
    },
    
    create: function(){
        gameOver = false;
        
        sonidoFondo = juego.add.audio('sonido');
        sonidoFondo.loop = true;
        
        var botonInicio = juego.add.text(juego.width/2, juego.height/2, 'Haz clic para empezar', 
            { 
                font: 'bold 20px Arial', 
                fill: '#ffffff', 
                stroke: '#8B4513',
                strokeThickness: 4,
                align: 'center'
            });
        botonInicio.anchor.set(0.5);
        botonInicio.inputEnabled = true;
        botonInicio.events.onInputDown.add(iniciarAudio, this);
        
        fondoJuego = juego.add.tileSprite(0, 0, 370, 550, 'fondo');
        
        persona = juego.add.sprite(juego.width/2, juego.height/2, 'personas');
        persona.anchor.setTo(0.5);
        persona.animations.add('arriba',[0,1,2,3,4,5,6,7,8],10,true);
        persona.animations.add('derecha',[27,28,29,30,31,32,33,34,35],10,true);
        persona.animations.add('izquierda',[9,10,11,12,13,14,15,16,17],10,true);
        persona.animations.add('abajo',[18,19,20,21,22,23,24,25,26],10,true);

        rocas = juego.add.group();
        rocas.enableBody = true;

        crearEstrellaBonita();
        crearRocas();

        textoNivel = juego.add.text(15, 15, 'NIVEL ' + nivelActual, 
            { 
                font: 'bold 18px Arial', 
                fill: '#27E0F5', 
                stroke: '#8B4513',
                strokeThickness: 3,
                backgroundColor: 'rgba(139, 69, 19, 0.6)',
                padding: { x: 15, y: 8 }
            });
        textoNivel.anchor.set(0, 0);
        textoNivel.setShadow(2, 2, 'rgba(0, 0, 0, 0.7)', 3);

        teclaDerecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        teclaIzquierda = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        teclaArriba = juego.input.keyboard.addKey(Phaser.Keyboard.UP);
        teclaAbajo = juego.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        
        juego.physics.startSystem(Phaser.Physics.ARCADE);
        juego.physics.arcade.enable(persona);
        juego.physics.arcade.enable(estrella);
        
        persona.body.collideWorldBounds = true;
        estrella.body.collideWorldBounds = true;
        
        // Animación SOLO si la estrella existe
        if (estrella && estrella.exists) {
            juego.add.tween(estrella.scale).to({ x: 1.15, y: 1.15 }, 1200, Phaser.Easing.Elastic.Out, true, 0, -1, true);
        }
    },
    
    update: function(){
        if (gameOver) return;
        
        if (!audioIniciado && (teclaDerecha.isDown || teclaIzquierda.isDown || 
            teclaArriba.isDown || teclaAbajo.isDown)) {
            iniciarAudio();
        }
        
        fondoJuego.tilePosition.x -= 1;
        
        if(teclaDerecha.isDown){
            persona.position.x += 3;
            persona.animations.play('derecha');
        }
        else if(teclaIzquierda.isDown){
            persona.position.x -= 3;
            persona.animations.play('izquierda');
        }
        else if(teclaArriba.isDown){
            persona.position.y -= 3;
            persona.animations.play('arriba');
        }
        else if(teclaAbajo.isDown){
            persona.position.y += 3;
            persona.animations.play('abajo');
        }
        else {
            persona.animations.stop();
        }
        
        // Solo verificar colisiones si la estrella existe
        if (estrella && estrella.exists) {
            juego.physics.arcade.overlap(persona, estrella, alcanzarEstrella, null, this);
        }
        
        juego.physics.arcade.overlap(persona, rocas, tocarRoca, null, this);
    }
};

function crearEstrellaBonita() {
    var posX = juego.rnd.integerInRange(60, juego.width - 60);  // Cambié a posX
    var posY = juego.rnd.integerInRange(60, juego.height - 60); // Cambié a posY
    
    var bmd = juego.add.bitmapData(50, 50);
    
    // Fondo dorado para la estrella
    bmd.ctx.fillStyle = '#FFD700';
    bmd.ctx.beginPath();
    bmd.ctx.arc(25, 25, 25, 0, Math.PI * 2);
    bmd.ctx.fill();
    
    // Dibujar estrella de 5 puntas
    bmd.ctx.fillStyle = '#FFFF00';
    bmd.ctx.beginPath();
    
    var spikes = 5;
    var outerRadius = 25;
    var innerRadius = 12;
    var rotation = Math.PI / 2 * 3;
    var centerX = 25;  // Usar centerX para el centro del bitmap
    var centerY = 25;  // Usar centerY para el centro del bitmap
    var step = Math.PI / spikes;
    
    bmd.ctx.moveTo(centerX, centerY - outerRadius);
    
    for (var i = 0; i < spikes; i++) {
        var pointX = centerX + Math.cos(rotation) * outerRadius;  // Usar pointX
        var pointY = centerY + Math.sin(rotation) * outerRadius;  // Usar pointY
        bmd.ctx.lineTo(pointX, pointY);
        rotation += step;
        
        pointX = centerX + Math.cos(rotation) * innerRadius;     // Usar pointX
        pointY = centerY + Math.sin(rotation) * innerRadius;     // Usar pointY
        bmd.ctx.lineTo(pointX, pointY);
        rotation += step;
    }
    
    bmd.ctx.lineTo(centerX, centerY - outerRadius);
    bmd.ctx.closePath();
    bmd.ctx.fill();
    
    // Destello en el centro
    var gradReflejo = bmd.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 10);
    gradReflejo.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradReflejo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    bmd.ctx.fillStyle = gradReflejo;
    bmd.ctx.beginPath();
    bmd.ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    bmd.ctx.fill();
    
    // Borde dorado
    bmd.ctx.strokeStyle = '#FFA500';
    bmd.ctx.lineWidth = 2;
    bmd.ctx.beginPath();
    bmd.ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
    bmd.ctx.stroke();
    
    // Resplandor
    bmd.ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    bmd.ctx.lineWidth = 4;
    bmd.ctx.beginPath();
    bmd.ctx.arc(centerX, centerY, 27, 0, Math.PI * 2);
    bmd.ctx.stroke();
    
    estrella = juego.add.sprite(posX, posY, bmd);  // Usar posX y posY para la posición
    estrella.anchor.setTo(0.5);
    
    juego.physics.arcade.enable(estrella);
    estrella.body.collideWorldBounds = true;
    
    // Añadir animación después de crear la estrella
    juego.add.tween(estrella.scale).to({ x: 1.15, y: 1.15 }, 1200, Phaser.Easing.Elastic.Out, true, 0, -1, true);
    
    return estrella;  // Añadir return para consistencia
}

function crearRocas() {
    rocas.removeAll();
    
    for (var i = 0; i < numeroRocas; i++) {
        crearRocaIndividual();
    }
}

function crearRocaIndividual() {
    var x, y;
    var intentos = 0;
    var posicionValida = false;
    
    while (!posicionValida && intentos < 50) {
        x = juego.rnd.integerInRange(40, juego.width - 40);
        y = juego.rnd.integerInRange(40, juego.height - 40);
        
        var distPersona = Phaser.Math.distance(x, y, persona.x, persona.y);
        var distEstrella = Phaser.Math.distance(x, y, estrella.x, estrella.y);
        
        var cercaDeOtraRoca = false;
        rocas.forEach(function(roca) {
            if (Phaser.Math.distance(x, y, roca.x, roca.y) < 60) {
                cercaDeOtraRoca = true;
            }
        }, this);
        
        if (distPersona > 100 && distEstrella > 80 && !cercaDeOtraRoca) {
            posicionValida = true;
        }
        intentos++;
    }
    
    if (!posicionValida) {
        x = juego.rnd.integerInRange(40, juego.width - 40);
        y = juego.rnd.integerInRange(40, juego.height - 40);
    }
    
    var roca = juego.add.sprite(x, y);
    juego.physics.arcade.enable(roca);
    
    var graphics = new Phaser.Graphics(juego, 0, 0);
    
    // Dibujar una roca irregular
    graphics.beginFill(0x696969);
    
    // Forma irregular de roca
    graphics.moveTo(-15, 5);
    graphics.lineTo(-10, -10);
    graphics.lineTo(5, -15);
    graphics.lineTo(15, -5);
    graphics.lineTo(10, 10);
    graphics.lineTo(-5, 15);
    graphics.lineTo(-15, 5);
    
    graphics.endFill();
    
    // Añadir textura a la roca
    graphics.beginFill(0x808080);
    graphics.drawEllipse(-8, -3, 6, 4);
    graphics.drawEllipse(5, 2, 5, 3);
    graphics.drawEllipse(-2, 8, 4, 3);
    graphics.endFill();
    
    // Sombra para dar profundidad
    graphics.beginFill(0x404040);
    graphics.drawEllipse(-12, 8, 8, 5);
    graphics.endFill();
    
    roca.addChild(graphics);
    roca.body.setSize(25, 25, -12.5, -12.5);
    
    rocas.add(roca);
    
    roca.scale.set(0);
    juego.add.tween(roca.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Back.Out, true);
    
    return roca;
}

function alcanzarEstrella(persona, estrella) {
    if (gameOver) return;
    
    crearEfectoParticulas(estrella.x, estrella.y);
    
    // Guardar referencia a la estrella actual antes de destruirla
    var estrellaX = estrella.x;
    var estrellaY = estrella.y;
    
    // Destruir la estrella
    estrella.destroy();
    estrella = null; // Importante: limpiar la referencia
    
    numeroRocas++;
    
    mostrarMensajeNivel();
    
    nivelActual++;
    textoNivel.text = 'NIVEL ' + nivelActual;
    
    // Crear nueva estrella después de 2 segundos
    juego.time.events.add(Phaser.Timer.SECOND * 2, function() {
        crearEstrellaBonita();
        crearRocas();
        
        // La animación se añade automáticamente en crearEstrellaBonita()
    }, this);
}

function tocarRoca(persona, roca) {
    if (gameOver) return;
    
    gameOver = true;
    
    crearEfectoExplosion(persona.x, persona.y);
    
    var tween = juego.add.tween(persona).to({ alpha: 0 }, 200, Phaser.Easing.Cubic.Out, true, 0, 6, true);
    
    juego.time.events.add(500, function() {
        mostrarGameOver();
    }, this);
}

function mostrarMensajeNivel() {
    var mensajeFondo = juego.add.graphics(0, 0);
    mensajeFondo.beginFill(0x000000, 0.85);
    mensajeFondo.drawRoundedRect(juego.width/2 - 160, juego.height/2 - 70, 320, 140, 20);
    mensajeFondo.endFill();
    
    mensajeFondo.lineStyle(3, 0xFFD700, 1);
    mensajeFondo.drawRoundedRect(juego.width/2 - 160, juego.height/2 - 70, 320, 140, 20);
    
    var mensaje = juego.add.text(juego.width/2, juego.height/2 - 30, 
        '¡FELICIDADES!', 
        { 
            font: 'bold 28px Arial', 
            fill: '#27D3F5', 
            align: 'center',
            stroke: '#8B4513',
            strokeThickness: 4
        });
    mensaje.anchor.set(0.5);
    
    var subMensaje = juego.add.text(juego.width/2, juego.height/2 + 20, 
        'Nivel ' + nivelActual + ' Completado', 
        { 
            font: 'bold 20px Arial', 
            fill: '#27D3F5', 
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
    subMensaje.anchor.set(0.5);
    
    juego.time.events.add(2000, function() {
        mensajeFondo.destroy();
        mensaje.destroy();
        subMensaje.destroy();
    }, this);
}

function mostrarGameOver() {
    var gameOverFondo = juego.add.graphics(0, 0);
    gameOverFondo.beginFill(0x000000, 0.9);
    gameOverFondo.drawRoundedRect(juego.width/2 - 170, juego.height/2 - 100, 340, 200, 25);
    gameOverFondo.endFill();
    
    gameOverFondo.lineStyle(4, 0xFF0000, 1);
    gameOverFondo.drawRoundedRect(juego.width/2 - 170, juego.height/2 - 100, 340, 200, 25);
    
    var gameOverText = juego.add.text(juego.width/2, juego.height/2 - 50, 
        '¡GAME OVER!', 
        { 
            font: 'bold 32px Arial', 
            fill: '#9127F5', 
            align: 'center',
            stroke: '#000000',
            strokeThickness: 5
        });
    gameOverText.anchor.set(0.5);
    
    var nivelText = juego.add.text(juego.width/2, juego.height/2, 
        'Alcanzaste el Nivel ' + nivelActual, 
        { 
            font: 'bold 20px Arial', 
            fill: '#FFFFFF', 
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
    nivelText.anchor.set(0.5);
    
    var reinicioText = juego.add.text(juego.width/2, juego.height/2 + 50, 
        'Haz CLIC para Jugar de Nuevo', 
        { 
            font: 'bold 18px Arial', 
            fill: '#00FF00', 
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
    reinicioText.anchor.set(0.5);
    reinicioText.inputEnabled = true;
    
    juego.add.tween(reinicioText).to({ alpha: 0.5 }, 800, Phaser.Easing.Cubic.InOut, true, 0, -1, true);
    
    var reiniciar = function() {
        nivelActual = 1;
        numeroRocas = 2;
        juego.state.restart();
    };
    
    reinicioText.events.onInputDown.add(reiniciar, this);
    juego.input.onDown.add(reiniciar, this);
}

function crearEfectoParticulas(x, y) {
    for (var i = 0; i < 15; i++) {
        var particle = juego.add.graphics(x, y);
        var color = juego.rnd.pick([0xFFFF00, 0xFFD700, 0xFFA500, 0xFFEC8B, 0xFFFFFF]);
        particle.beginFill(color);
        
        var size = juego.rnd.integerInRange(4, 8);
        particle.drawCircle(0, 0, size);
        particle.endFill();
        
        var angle = juego.rnd.realInRange(0, Math.PI * 2);
        var speed = juego.rnd.integerInRange(100, 250);
        
        juego.add.tween(particle).to({
            x: x + Math.cos(angle) * speed,
            y: y + Math.sin(angle) * speed,
            alpha: 0,
            rotation: juego.rnd.realInRange(-2, 2)
        }, 1000, Phaser.Easing.Cubic.Out, true).onComplete.add(function() {
            particle.destroy();
        });
    }
}

function crearEfectoExplosion(x, y) {
    for (var i = 0; i < 20; i++) {
        var particle = juego.add.graphics(x, y);
        var color = juego.rnd.pick([0xFF0000, 0x8B0000, 0xDC143C, 0xB22222, 0x8B4513]);
        particle.beginFill(color);
        
        var size = juego.rnd.integerInRange(3, 7);
        particle.drawRect(0, 0, size, size);
        particle.endFill();
        
        var angle = juego.rnd.realInRange(0, Math.PI * 2);
        var speed = juego.rnd.integerInRange(150, 300);
        
        juego.add.tween(particle).to({
            x: x + Math.cos(angle) * speed,
            y: y + Math.sin(angle) * speed,
            alpha: 0,
            rotation: juego.rnd.realInRange(-3, 3)
        }, 1200, Phaser.Easing.Cubic.Out, true).onComplete.add(function() {
            particle.destroy();
        });
    }
}

function iniciarAudio() {
    if (!audioIniciado) {
        sonidoFondo.play();
        audioIniciado = true;
        juego.world.children.forEach(function(child) {
            if (child.text === 'Haz clic para empezar') {
                child.destroy();
            }
        });
    }
}


juego.state.add('portada', estadoPortada);
juego.state.add('principal', estadoPrincipal);
juego.state.start('portada'); // <- antes era 'principal'
