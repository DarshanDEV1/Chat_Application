import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

var camera, scene, renderer;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var letterGroup;
var textureLoader;

init();
animate();

function init() {
    try {
        camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.z = 1000;
        scene = new THREE.Scene();
        scene.background = new THREE.Color('black');
        scene.fog = new THREE.Fog(0x2b2b2b, 1, 10000);

        letterGroup = new THREE.Group();
        textureLoader = new THREE.TextureLoader();

        // Create a simple letter 'D' model
        var geometry = new THREE.BoxGeometry(200, 400, 50);
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        var letterD = new THREE.Mesh(geometry, material);
        letterD.position.set(-200, 0, 0);
        letterGroup.add(letterD);

        scene.add(letterGroup);

        initRenderer();
        initEventListeners();
    } catch (error) {
        console.error('Error initializing Three.js:', error);
    }
}

function initRenderer() {
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        window.addEventListener('resize', onWindowResize, false);
    } catch (error) {
        console.error('Error initializing renderer:', error);
    }
}

function initEventListeners() {
    // Handle swipe gestures on mobile
    var touchStartX = 0;
    var touchMoveX = 0;

    document.addEventListener('touchstart', function(event) {
        touchStartX = event.touches[0].clientX;
        touchMoveX = touchStartX;
    }, false);

    document.addEventListener('touchmove', function(event) {
        touchMoveX = event.touches[0].clientX;
    }, false);

    document.addEventListener('touchend', function(event) {
        var swipeDistance = touchMoveX - touchStartX;
        if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance threshold
            var rotationAmount = swipeDistance * 0.005; // Adjust sensitivity as needed
            rotateModelY(rotationAmount);
        }
    }, false);

    // Handle mouse movement on desktop
    document.addEventListener('mousemove', function(event) {
        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var rotationAmount = movementX * 0.01; // Adjust sensitivity as needed
        rotateModelY(rotationAmount);
    }, false);

    // Handle file upload
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', onFileUpload);
    document.body.appendChild(fileInput);
}

function rotateModelY(rotationAmount) {
    letterGroup.rotation.y += rotationAmount;
}

function onFileUpload(event) {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var texture = textureLoader.load(e.target.result, function() {
                applyTextureToModel(texture);
            });
        };
        reader.readAsDataURL(file);
    }
}

function applyTextureToModel(texture) {
    letterGroup.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            child.material.map = texture;
            child.material.needsUpdate = true;
        }
    });
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// function onDocumentMouseMove(event) {
//     mouseX = (event.clientX - windowHalfX) * 10;
//     mouseY = (event.clientY - windowHalfY) * 10;
// }

function animate() {
    try {
        requestAnimationFrame(animate);
        render();
    } catch (error) {
        console.error('Error animating:', error);
    }
}

function render() {
    if (renderer) {
        var time = Date.now() * 0.001;
        var rx = Math.sin(time * 0.7) * 0.5,
            ry = Math.sin(time * 0.3) * 0.5,
            rz = Math.sin(time * 0.2) * 0.5;
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        letterGroup.rotation.x = rx;
        letterGroup.rotation.y = ry;
        letterGroup.rotation.z = rz;
        renderer.render(scene, camera);
    }
}
