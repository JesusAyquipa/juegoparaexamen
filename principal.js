var juego = new Phaser.Game(370, 550, Phaser.CANVAS, 'bloque_juego');
var fondoJuego;
var persona;
var sonidoFondo;
var bola;
var textoNivel;
var nivelActual = 1;
var audioIniciado = false;
var pinchos;
var numeroPinchos = 2;
var gameOver = false;
var teclaDerecha, teclaIzquierda, teclaArriba, teclaAbajo;

var estadoPrincipal = {
    preload: function (){
        juego.load.image('fondo', 'fondo3.jpg');
        juego.load.spritesheet('personas','persona.png',64,64);
        juego.load.audio('sonido','sonido.mp3');
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

        pinchos = juego.add.group();
        pinchos.enableBody = true;

        crearBolaBonita();
        crearPinchos();

        textoNivel = juego.add.text(15, 15, 'NIVEL ' + nivelActual, 
            { 
                font: 'bold 18px Arial', 
                fill: '#FFD700', 
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
        juego.physics.arcade.enable(bola);
        
        persona.body.collideWorldBounds = true;
        bola.body.collideWorldBounds = true;
        
        // Animación SOLO si la bola existe
        if (bola && bola.exists) {
            juego.add.tween(bola.scale).to({ x: 1.15, y: 1.15 }, 1200, Phaser.Easing.Elastic.Out, true, 0, -1, true);
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
        
        // Solo verificar colisiones si la bola existe
        if (bola && bola.exists) {
            juego.physics.arcade.overlap(persona, bola, alcanzarBola, null, this);
        }
        
        juego.physics.arcade.overlap(persona, pinchos, tocarPincho, null, this);
    }
};

function crearBolaBonita() {
    var x = juego.rnd.integerInRange(60, juego.width - 60);
    var y = juego.rnd.integerInRange(60, juego.height - 60);
    
    var bmd = juego.add.bitmapData(50, 50);
    
    var grad = bmd.ctx.createRadialGradient(25, 25, 5, 25, 25, 25);
    grad.addColorStop(0, '#FFFF00');
    grad.addColorStop(0.4, '#FFA500');
    grad.addColorStop(0.7, '#FF4500');
    grad.addColorStop(1, '#DC143C');
    
    bmd.ctx.fillStyle = grad;
    bmd.ctx.beginPath();
    bmd.ctx.arc(25, 25, 25, 0, Math.PI * 2);
    bmd.ctx.fill();
    
    var gradReflejo = bmd.ctx.createRadialGradient(15, 15, 0, 15, 15, 12);
    gradReflejo.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradReflejo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    bmd.ctx.fillStyle = gradReflejo;
    bmd.ctx.beginPath();
    bmd.ctx.arc(15, 15, 12, 0, Math.PI * 2);
    bmd.ctx.fill();
    
    bmd.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    bmd.ctx.beginPath();
    bmd.ctx.arc(12, 12, 4, 0, Math.PI * 2);
    bmd.ctx.fill();
    
    bmd.ctx.strokeStyle = '#FFD700';
    bmd.ctx.lineWidth = 2;
    bmd.ctx.beginPath();
    bmd.ctx.arc(25, 25, 25, 0, Math.PI * 2);
    bmd.ctx.stroke();
    
    bmd.ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    bmd.ctx.lineWidth = 4;
    bmd.ctx.beginPath();
    bmd.ctx.arc(25, 25, 27, 0, Math.PI * 2);
    bmd.ctx.stroke();
    
    bola = juego.add.sprite(x, y, bmd);
    bola.anchor.setTo(0.5);
    
    juego.physics.arcade.enable(bola);
    bola.body.collideWorldBounds = true;
    
    // Añadir animación después de crear la bola
    juego.add.tween(bola.scale).to({ x: 1.15, y: 1.15 }, 1200, Phaser.Easing.Elastic.Out, true, 0, -1, true);
}

function crearPinchos() {
    pinchos.removeAll();
    
    for (var i = 0; i < numeroPinchos; i++) {
        crearPinchoIndividual();
    }
}

function crearPinchoIndividual() {
    var x, y;
    var intentos = 0;
    var posicionValida = false;
    
    while (!posicionValida && intentos < 50) {
        x = juego.rnd.integerInRange(40, juego.width - 40);
        y = juego.rnd.integerInRange(40, juego.height - 40);
        
        var distPersona = Phaser.Math.distance(x, y, persona.x, persona.y);
        var distBola = Phaser.Math.distance(x, y, bola.x, bola.y);
        
        var cercaDeOtroPincho = false;
        pinchos.forEach(function(pincho) {
            if (Phaser.Math.distance(x, y, pincho.x, pincho.y) < 60) {
                cercaDeOtroPincho = true;
            }
        }, this);
        
        if (distPersona > 100 && distBola > 80 && !cercaDeOtroPincho) {
            posicionValida = true;
        }
        intentos++;
    }
    
    if (!posicionValida) {
        x = juego.rnd.integerInRange(40, juego.width - 40);
        y = juego.rnd.integerInRange(40, juego.height - 40);
    }
    
    var pincho = juego.add.sprite(x, y);
    juego.physics.arcade.enable(pincho);
    
    var graphics = new Phaser.Graphics(juego, 0, 0);
    
    graphics.beginFill(0x8B4513);
    graphics.drawRect(-12, 20, 24, 10);
    graphics.endFill();
    
    graphics.beginFill(0xDC143C);
    graphics.moveTo(0, -25);
    graphics.lineTo(15, 20);
    graphics.lineTo(-15, 20);
    graphics.lineTo(0, -25);
    graphics.endFill();
    
    graphics.beginFill(0xFF6347);
    graphics.moveTo(0, -20);
    graphics.lineTo(8, 15);
    graphics.lineTo(-8, 15);
    graphics.lineTo(0, -20);
    graphics.endFill();
    
    graphics.beginFill(0xC0C0C0);
    graphics.moveTo(0, -25);
    graphics.lineTo(4, -15);
    graphics.lineTo(-4, -15);
    graphics.lineTo(0, -25);
    graphics.endFill();
    
    graphics.beginFill(0xFFFFFF);
    graphics.moveTo(0, -23);
    graphics.lineTo(2, -17);
    graphics.lineTo(-2, -17);
    graphics.lineTo(0, -23);
    graphics.endFill();
    
    pincho.addChild(graphics);
    pincho.body.setSize(20, 30, -10, -20);
    
    pinchos.add(pincho);
    
    pincho.scale.set(0);
    juego.add.tween(pincho.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Back.Out, true);
    
    return pincho;
}

function alcanzarBola(persona, bola) {
    if (gameOver) return;
    
    crearEfectoParticulas(bola.x, bola.y);
    
    // Guardar referencia a la bola actual antes de destruirla
    var bolaX = bola.x;
    var bolaY = bola.y;
    
    // Destruir la bola
    bola.destroy();
    bola = null; // Importante: limpiar la referencia
    
    numeroPinchos++;
    
    mostrarMensajeNivel();
    
    nivelActual++;
    textoNivel.text = 'NIVEL ' + nivelActual;
    
    // Crear nueva bola después de 2 segundos
    juego.time.events.add(Phaser.Timer.SECOND * 2, function() {
        crearBolaBonita();
        crearPinchos();
        
        // La animación se añade automáticamente en crearBolaBonita()
    }, this);
}

function tocarPincho(persona, pincho) {
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
            fill: '#FFD700', 
            align: 'center',
            stroke: '#8B4513',
            strokeThickness: 4
        });
    mensaje.anchor.set(0.5);
    
    var subMensaje = juego.add.text(juego.width/2, juego.height/2 + 20, 
        'Nivel ' + nivelActual + ' Completado', 
        { 
            font: 'bold 20px Arial', 
            fill: '#FFFFFF', 
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
            fill: '#FF0000', 
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
        numeroPinchos = 2;
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

juego.state.add('principal', estadoPrincipal);
juego.state.start('principal');