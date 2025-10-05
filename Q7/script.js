// SOOK Compliant Bowling Game - With Manual Controls
class BowlingGame {
    constructor() {
        this.currentFrame = 1;
        this.currentRoll = 1;
        this.frames = Array(10).fill(null).map(() => ({
            rolls: [],
            score: null,
            isStrike: false,
            isSpare: false,
            isComplete: false
        }));
        this.totalScore = 0;
        this.gameOver = false;
        this.pinsStanding = Array(10).fill(true);
        this.ballInMotion = false;
        this.aimAngle = 0;
        this.power = 50;
        this.cameraMode = 0;
        
        this.init3D();
        this.setupUI();
        this.animate();
    }
    
    init3D() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x2c5530);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.setCameraPosition();
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);
        
        // Physics
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 20, 0);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Bowling alley components
        this.createLane();
        this.createPins();
        this.createBall();
        
        // Window resize handler
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createLane() {
        // Lane surface
        const laneGeometry = new THREE.BoxGeometry(2, 0.1, 20);
        const laneMaterial = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
        this.lane = new THREE.Mesh(laneGeometry, laneMaterial);
        this.lane.position.set(0, -0.05, 0);
        this.lane.receiveShadow = true;
        this.scene.add(this.lane);
        
        // Physics ground
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.add(groundBody);
        
        // Foul line
        const foulGeometry = new THREE.BoxGeometry(2, 0.02, 0.05);
        const foulMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const foulLine = new THREE.Mesh(foulGeometry, foulMaterial);
        foulLine.position.set(0, 0.01, -8);
        this.scene.add(foulLine);
    }
    
    createPins() {
        this.pins = [];
        const positions = [
            [0, 0],           // Pin 1
            [-0.12, 0.21],    // Pin 2
            [0.12, 0.21],     // Pin 3  
            [-0.24, 0.42],    // Pin 4
            [0, 0.42],        // Pin 5
            [0.24, 0.42],     // Pin 6
            [-0.36, 0.63],    // Pin 7
            [-0.12, 0.63],    // Pin 8
            [0.12, 0.63],     // Pin 9
            [0.36, 0.63]      // Pin 10
        ];
        
        positions.forEach((pos, i) => {
            this.createPin(pos[0], 8 + pos[1], i + 1);
        });
    }
    
    createPin(x, z, number) {
        const pinGeometry = new THREE.CylinderGeometry(0.03, 0.06, 0.38, 8);
        const pinMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const pin = new THREE.Mesh(pinGeometry, pinMaterial);
        pin.position.set(x, 0.19, z);
        pin.castShadow = true;
        pin.userData = { number: number, isStanding: true };
        this.scene.add(pin);
        
        const pinShape = new CANNON.Cylinder(0.03, 0.06, 0.38, 8);
        const pinBody = new CANNON.Body({ mass: 1.5 });
        pinBody.addShape(pinShape);
        pinBody.position.set(x, 0.19, z);
        pinBody.material = new CANNON.Material({ friction: 0.3, restitution: 0.3 });
        this.world.add(pinBody);
        
        pin.userData.body = pinBody;
        this.pins.push(pin);
    }
    
    createBall() {
        const ballGeometry = new THREE.SphereGeometry(0.11, 32, 32);
        const ballMaterial = new THREE.MeshLambertMaterial({ color: 0x000080 });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.position.set(0, 0.11, -9);
        this.ball.castShadow = true;
        this.scene.add(this.ball);
        
        const ballShape = new CANNON.Sphere(0.11);
        const ballBody = new CANNON.Body({ mass: 7.26 });
        ballBody.addShape(ballShape);
        ballBody.position.set(0, 0.11, -9);
        ballBody.material = new CANNON.Material({ friction: 0.1, restitution: 0.8 });
        this.world.add(ballBody);
        
        this.ball.userData = { body: ballBody };
    }
    
    setupUI() {
        this.createScoreboard();
        this.updateDisplay();
        
        // Setup slider controls
        const powerSlider = document.getElementById('powerSlider');
        const angleSlider = document.getElementById('angleSlider');
        const powerValue = document.getElementById('powerValue');
        const angleValue = document.getElementById('angleValue');
        
        powerSlider.addEventListener('input', (e) => {
            this.power = parseInt(e.target.value);
            powerValue.textContent = this.power;
        });
        
        angleSlider.addEventListener('input', (e) => {
            const angleDegrees = parseInt(e.target.value);
            angleValue.textContent = angleDegrees;
            // Convert degrees to radians for game logic
            this.aimAngle = (angleDegrees * Math.PI) / 180;
            this.updateBallPosition();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') { 
                e.preventDefault(); 
                this.rollBall(); 
            }
        });
    }
    
    updateBallPosition() {
        if (this.ballInMotion || this.gameOver) return;
        
        const x = Math.sin(this.aimAngle) * 1.5;
        if (this.ball.userData.body.velocity.length() < 0.1) {
            this.ball.userData.body.position.x = x;
            this.ball.position.x = x;
        }
    }
    
    createScoreboard() {
        const scoreboard = document.getElementById('scoreboard');
        scoreboard.innerHTML = '';
        
        for (let i = 0; i < 10; i++) {
            const frame = document.createElement('div');
            frame.className = 'frame';
            frame.id = `frame-${i + 1}`;
            
            frame.innerHTML = `
                <div class="frame-num">${i + 1}</div>
                <div class="rolls" id="rolls-${i + 1}">-</div>
                <div class="score" id="score-${i + 1}">-</div>
            `;
            
            scoreboard.appendChild(frame);
        }
    }
    
    rollBall() {
        if (this.ballInMotion || this.gameOver) return;
        
        this.ballInMotion = true;
        
        // Calculate force based on power and aim
        const forceMultiplier = 15 + (this.power / 100) * 20;
        const forceX = Math.sin(this.aimAngle) * forceMultiplier * 0.3;
        const forceZ = forceMultiplier;
        
        // Apply force to ball
        this.ball.userData.body.velocity.set(forceX, 0, forceZ);
        this.ball.userData.body.angularVelocity.set(
            Math.random() * 2 - 1,
            0,
            forceMultiplier * 0.1
        );
        
        // Disable controls during roll
        document.getElementById('rollBtn').disabled = true;
        document.getElementById('powerSlider').disabled = true;
        document.getElementById('angleSlider').disabled = true;
        
        // Check for roll completion
        setTimeout(() => this.checkRollComplete(), 3000);
    }
    
    checkRollComplete() {
        const checkInterval = setInterval(() => {
            const ballVelocity = this.ball.userData.body.velocity;
            const ballSpeed = Math.sqrt(ballVelocity.x ** 2 + ballVelocity.y ** 2 + ballVelocity.z ** 2);
            
            if (ballSpeed < 0.1 || this.ball.position.z > 12) {
                clearInterval(checkInterval);
                this.endRoll();
            }
        }, 100);
    }
    
    endRoll() {
        this.ballInMotion = false;
        
        // Re-enable controls
        document.getElementById('rollBtn').disabled = false;
        document.getElementById('powerSlider').disabled = false;
        document.getElementById('angleSlider').disabled = false;
        
        // Count knocked down pins
        const pinsDown = this.countKnockedPins();
        this.recordRoll(pinsDown);
        
        // Show celebration
        if (pinsDown === 10 && this.currentRoll === 1) {
            this.showMessage('STRIKE!', '#ff4444');
        } else if (this.frames[this.currentFrame - 1].isSpare) {
            this.showMessage('SPARE!', '#ffaa00');
        }
        
        setTimeout(() => this.prepareNextRoll(), 2000);
    }
    
    countKnockedPins() {
        let knockedDown = 0;
        
        this.pins.forEach((pin, index) => {
            if (pin.userData.isStanding) {
                const rotation = pin.rotation;
                const isDown = Math.abs(rotation.x) > 0.3 || 
                              Math.abs(rotation.z) > 0.3 || 
                              pin.position.y < 0.05;
                
                if (isDown) {
                    pin.userData.isStanding = false;
                    this.pinsStanding[index] = false;
                    pin.material.color.setHex(0xFFAAAA);
                    knockedDown++;
                    
                    const pinElement = document.getElementById(`pin-${index + 1}`);
                    if (pinElement) pinElement.classList.add('down');
                }
            }
        });
        
        return knockedDown;
    }
    
    recordRoll(pinsDown) {
        const frameIndex = this.currentFrame - 1;
        const frame = this.frames[frameIndex];
        
        frame.rolls.push(pinsDown);
        
        if (this.currentFrame < 10) {
            if (this.currentRoll === 1) {
                if (pinsDown === 10) {
                    frame.isStrike = true;
                    frame.isComplete = true;
                    this.nextFrame();
                } else {
                    this.currentRoll = 2;
                }
            } else {
                if (frame.rolls[0] + pinsDown === 10) {
                    frame.isSpare = true;
                }
                frame.isComplete = true;
                this.nextFrame();
            }
        } else {
            this.handle10thFrame(pinsDown);
        }
        
        this.calculateScores();
        this.updateDisplay();
    }
    
    handle10thFrame(pinsDown) {
        const frame = this.frames[9];
        
        if (this.currentRoll === 1) {
            if (pinsDown === 10) {
                frame.isStrike = true;
                this.resetPins();
            }
            this.currentRoll = 2;
        } else if (this.currentRoll === 2) {
            if (!frame.isStrike && frame.rolls[0] + pinsDown === 10) {
                frame.isSpare = true;
                this.resetPins();
            } else if (frame.isStrike && pinsDown === 10) {
                this.resetPins();
            }
            
            if (frame.isStrike || frame.isSpare) {
                this.currentRoll = 3;
            } else {
                this.endGame();
                return;
            }
        } else {
            this.endGame();
            return;
        }
    }
    
    calculateScores() {
        let totalScore = 0;
        
        for (let i = 0; i < 10; i++) {
            const frame = this.frames[i];
            let frameScore = 0;
            
            if (i < 9) {
                if (frame.isStrike) {
                    frameScore = 10;
                    const nextFrame = this.frames[i + 1];
                    if (nextFrame.rolls.length > 0) {
                        frameScore += nextFrame.rolls[0];
                        if (nextFrame.isStrike && i < 8) {
                            const frameAfterNext = this.frames[i + 2];
                            if (frameAfterNext.rolls.length > 0) {
                                frameScore += frameAfterNext.rolls[0];
                            }
                        } else if (nextFrame.rolls.length > 1) {
                            frameScore += nextFrame.rolls[1];
                        }
                    }
                } else if (frame.isSpare) {
                    frameScore = 10;
                    const nextFrame = this.frames[i + 1];
                    if (nextFrame.rolls.length > 0) {
                        frameScore += nextFrame.rolls[0];
                    }
                } else {
                    frameScore = frame.rolls.reduce((sum, roll) => sum + roll, 0);
                }
            } else {
                frameScore = frame.rolls.reduce((sum, roll) => sum + roll, 0);
            }
            
            frame.score = frameScore;
            totalScore += frameScore;
        }
        
        this.totalScore = totalScore;
    }
    
    nextFrame() {
        this.currentFrame++;
        this.currentRoll = 1;
        this.resetPins();
    }
    
    resetPins() {
        this.pins.forEach((pin, index) => {
            if (!pin.userData.isStanding) {
                this.scene.remove(pin);
                this.world.remove(pin.userData.body);
            }
        });
        
        this.createPins();
        this.pinsStanding.fill(true);
        this.resetBall();
        this.updatePinDisplay();
    }
    
    resetBall() {
        this.ball.userData.body.position.set(0, 0.11, -9);
        this.ball.userData.body.velocity.set(0, 0, 0);
        this.ball.userData.body.angularVelocity.set(0, 0, 0);
        this.ball.position.copy(this.ball.userData.body.position);
        this.aimAngle = 0;
        
        // Reset sliders
        document.getElementById('angleSlider').value = 0;
        document.getElementById('angleValue').textContent = 0;
    }
    
    prepareNextRoll() {
        if (this.gameOver) return;
        
        const frame = this.frames[this.currentFrame - 1];
        if (this.currentRoll === 2 && !frame.isStrike) {
            this.resetBall();
        } else {
            this.resetBall();
        }
    }
    
    endGame() {
        this.gameOver = true;
        
        let message = '';
        if (this.totalScore === 300) {
            message = 'PERFECT GAME! Incredible!';
        } else if (this.totalScore >= 200) {
            message = 'Excellent! Professional level!';
        } else if (this.totalScore >= 150) {
            message = 'Great game! Well done!';
        } else if (this.totalScore >= 100) {
            message = 'Good job! Keep practicing!';
        } else {
            message = 'Nice try! Play again!';
        }
        
        this.showMessage(`Game Complete!\nFinal Score: ${this.totalScore}\n${message}`, '#4a9eff');
    }
    
    updateDisplay() {
        document.getElementById('currentFrame').textContent = this.currentFrame;
        document.getElementById('currentRoll').textContent = this.currentRoll;
        document.getElementById('totalScore').textContent = this.totalScore;
        document.getElementById('pinsDown').textContent = 10 - this.pinsStanding.filter(p => p).length;
        
        for (let i = 0; i < 10; i++) {
            const frame = this.frames[i];
            const frameElement = document.getElementById(`frame-${i + 1}`);
            const rollsElement = document.getElementById(`rolls-${i + 1}`);
            const scoreElement = document.getElementById(`score-${i + 1}`);
            
            frameElement.className = 'frame';
            if (i + 1 === this.currentFrame && !this.gameOver) {
                frameElement.classList.add('current');
            } else if (frame.isStrike) {
                frameElement.classList.add('strike');
            } else if (frame.isSpare) {
                frameElement.classList.add('spare');
            }
            
            let rollsText = '';
            if (frame.rolls.length > 0) {
                if (i < 9) {
                    if (frame.isStrike) {
                        rollsText = 'X';
                    } else if (frame.rolls.length === 2) {
                        if (frame.isSpare) {
                            rollsText = `${frame.rolls[0]} /`;
                        } else {
                            rollsText = `${frame.rolls[0]} ${frame.rolls[1]}`;
                        }
                    } else {
                        rollsText = frame.rolls[0].toString();
                    }
                } else {
                    rollsText = frame.rolls.map(roll => roll === 10 ? 'X' : roll).join(' ');
                    if (frame.rolls.length >= 2 && !frame.isStrike && frame.rolls[0] + frame.rolls[1] === 10) {
                        rollsText = `${frame.rolls[0]} /`;
                        if (frame.rolls.length === 3) {
                            rollsText += ` ${frame.rolls[2] === 10 ? 'X' : frame.rolls[2]}`;
                        }
                    }
                }
            }
            rollsElement.textContent = rollsText || '-';
            scoreElement.textContent = frame.score !== null ? frame.score : '-';
        }
        
        this.updatePinDisplay();
    }
    
    updatePinDisplay() {
        for (let i = 0; i < 10; i++) {
            const pinElement = document.getElementById(`pin-${i + 1}`);
            if (pinElement) {
                if (this.pinsStanding[i]) {
                    pinElement.classList.remove('down');
                } else {
                    pinElement.classList.add('down');
                }
            }
        }
    }
    
    showMessage(text, color = '#4a9eff') {
        const message = document.getElementById('message');
        message.textContent = text;
        message.style.color = color;
        message.style.display = 'block';
        
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000);
    }
    
    setCameraPosition() {
        switch (this.cameraMode) {
            case 0:
                this.camera.position.set(0, 2, -12);
                this.camera.lookAt(0, 0, 8);
                break;
            case 1:
                this.camera.position.set(5, 3, 0);
                this.camera.lookAt(0, 0, 0);
                break;
            case 2:
                this.camera.position.set(0, 1, 10);
                this.camera.lookAt(0, 0, -5);
                break;
        }
    }
    
    changeCamera() {
        this.cameraMode = (this.cameraMode + 1) % 3;
        this.setCameraPosition();
    }
    
    newGame() {
        this.currentFrame = 1;
        this.currentRoll = 1;
        this.frames = Array(10).fill(null).map(() => ({
            rolls: [],
            score: null,
            isStrike: false,
            isSpare: false,
            isComplete: false
        }));
        this.totalScore = 0;
        this.gameOver = false;
        this.pinsStanding.fill(true);
        this.ballInMotion = false;
        this.aimAngle = 0;
        this.power = 50;
        
        // Reset sliders
        document.getElementById('powerSlider').value = 50;
        document.getElementById('powerValue').textContent = 50;
        document.getElementById('angleSlider').value = 0;
        document.getElementById('angleValue').textContent = 0;
        
        this.resetPins();
        this.updateDisplay();
        document.getElementById('message').style.display = 'none';
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.world.step(1/60);
        
        if (this.ball.userData.body) {
            this.ball.position.copy(this.ball.userData.body.position);
            this.ball.quaternion.copy(this.ball.userData.body.quaternion);
        }
        
        this.pins.forEach(pin => {
            if (pin.userData.body) {
                pin.position.copy(pin.userData.body.position);
                pin.quaternion.copy(pin.userData.body.quaternion);
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Global functions
let game;

function rollBall() {
    if (game) game.rollBall();
}

function changeCamera() {
    if (game) game.changeCamera();
}

function newGame() {
    if (game) game.newGame();
}

document.addEventListener('DOMContentLoaded', () => {
    game = new BowlingGame();
});