import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui';
import space from '../src/8769.jpg' 
import prototypeGrid from '../src/Prototype_Grid.png'
let camera, orbitControls,scene, renderer;
let directionalLight1,spotLight, ambientLight; 
let showCube = false, showSphere = false, showMultiMesh = true;
const threejsCanvas = document.querySelector('#threejs-canvas');
const mouse = new THREE.Vector2(1, 1);
const raycaster = new THREE.Raycaster();
let mesh;
const objects = [];
const amount = parseInt(window.location.search.slice(1)) || 10;
const count = Math.pow(amount, 3);
const color = new THREE.Color();
const white = new THREE.Color().setHex( 0xffffff );
let speed = 0.01, step = 0;
initialize();
animate();

function initialize() {
    //Create a scene...
    let width = threejsCanvas.width;
    let height = threejsCanvas.height;
    scene = new THREE.Scene(); 
    //scene.fog = new THREE.Fog(0XFFFFF, 0, 150);
    scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);
    //Create a camera and define the perspective -> Orthographic or perspective
    camera = new THREE.PerspectiveCamera( 60, width/height, 0.1, 1000 );
    camera.position.set(amount, amount, amount);
    camera.lookAt(0, 0, 0);
    //Initialize the renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );
    const textureLoader = new THREE.TextureLoader();
    scene.background = textureLoader.load(space);
    threejsCanvas.appendChild( renderer.domElement );

    //#region Orbit Controls
    //Initializing orbit controls & adding listeners...
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.listenToKeyEvents(window)
    orbitControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    orbitControls.enableZoom = true;
    orbitControls.enablePan = false;
    orbitControls.minDistance = 10;
    orbitControls.maxDistance = 100;
    //#endregion

    //#region Initializing GUI elements
    
    //#endregion
    //Creating axes helpers...
    const axes = new THREE.AxesHelper(10);
    scene.add(axes);

    const gridHelper = new THREE.GridHelper(100, 25);
    scene.add(gridHelper);
    //#region Creating the lights

    //Create two directional Lights...
    directionalLight1 = new THREE.DirectionalLight(0x192841);
    const directionalLight1Helper = new THREE.DirectionalLightHelper(directionalLight1, 5);
    directionalLight1.position.set(-35, 40, 0);
    scene.add(directionalLight1);
    scene.add(directionalLight1Helper);

    //Create ambient light...
    ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

     //Create a spotlight
     spotLight = new THREE.SpotLight(0xffffff, 1.5 );
     spotLight.position.y = 35;
     spotLight.intensity = 0.5;
     spotLight.castShadow = true;
     const spotlightHelper = new THREE.SpotLightHelper(spotLight);
     scene.add( spotLight );
     scene.add(spotlightHelper);
     spotLight.angle = Math.PI / 9;
     spotLight.castShadow = true;
    //#endregion

    //#region Creating scene objects
    
    //Create a number of objects from the same geometry...
    const planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    const phongMaterial = new THREE.MeshPhongMaterial();
    const planeMesh = new THREE.Mesh(planeGeometry, phongMaterial);
    planeMesh.material.map = textureLoader.load(prototypeGrid);
    planeMesh.receiveShadow = true;
    planeMesh.rotation.x = -0.5 * Math.PI;
    scene.add(planeMesh);
    const material = new THREE.MeshToonMaterial( {color: 0x6C0BA9} );
    if(showMultiMesh) {
        const geometry = new THREE.SphereGeometry(0.5, 64, 64);
        mesh = new THREE.InstancedMesh(geometry, material, count);
        let i = 0;
        const offset = (amount - 2) / 2 
        const matrix = new THREE.Matrix4();
        for ( let x = 0; x < amount; x++) {
            for(let y = 0; y < amount; y++) {
                for(let z = 0; z < amount; z++) {
                    matrix.setPosition(offset - x, offset - y, offset - z);
                    
                    mesh.setMatrixAt(i, matrix);
                    mesh.setColorAt(i, color);
                    objects.push(mesh.children[i]);
                    i++;
                }
            }
        }
    }
    mesh.castShadow = true;
    scene.add(mesh);
    //#endregion

    //GUI Handling...
    const gui = new dat.GUI();
    const options = 
    {
        sphereColor : '#6C0BA9',
        positionX : 0,
        positionY : 0,
        positionZ : 0,
        speed: 0.01,
    };

    const geometryOptions = 
    {
        multi : false,
        cube : false,
        sphere : false
    }; 

    const lightingOptions = 
    {
        spotlightRadius : 9.0,
        spotlightPositionX : 0,
        spotlightPositionY : 0,
        spotlightPositionZ : 0,
        directionalLightPositionX : 0,
        directionalLightPositionY : 0,
        directionalLightPositionZ : 0,
        directionalLightRotationX : 0,
        directionalLightRotationY : 0,
        directionalLightRotationZ : 0,
        directionalLightIntensity : 0,
        spotlightIntensity : 0.0
    };

    var generalOptions = gui.addFolder('General Options');
    generalOptions.addColor(options, 'sphereColor').onChange(function(e) { mesh.material.color.set(e); });
    generalOptions.add(options, 'speed', 0, 1).onChange(function(e) { speed = e; });
    var positionFolder = gui.addFolder('Mesh Position')
    positionFolder.add(options, 'positionX', -100.0, 100.0).onChange(function(e) { mesh.position.x = e; });
    positionFolder.add(options, 'positionY', -100.0, 100.0).onChange(function(e) { mesh.position.y = e; });
    positionFolder.add(options, 'positionZ', -100.0, 100.0).onChange(function(e) { mesh.position.z = e; });
    var lightSettings = gui.addFolder('Lighting Settings');
    lightSettings.add(lightingOptions, 'spotlightRadius', 0 , 20).onChange(function(e) {
        spotLight.angle = Math.PI / e;
    });
    lightSettings.add(lightingOptions, 'spotlightPositionX', -100.0, 100.0).onChange(function(e) { spotLight.position.x = e; });
    lightSettings.add(lightingOptions, 'spotlightPositionY', -100.0, 100.0).onChange(function(e) { spotLight.position.y = e; });
    lightSettings.add(lightingOptions, 'spotlightPositionZ', -100.0, 100.0).onChange(function(e) { spotLight.position.z = e; });
    lightSettings.add(lightingOptions, 'directionalLightPositionX', -100.0, 100.0).onChange(function(e) { directionalLight1.position.x = e; });
    lightSettings.add(lightingOptions, 'directionalLightPositionY', -100.0, 100.0).onChange(function(e) { directionalLight1.position.y = e; });
    lightSettings.add(lightingOptions, 'directionalLightPositionZ', -100.0, 100.0).onChange(function(e) { directionalLight1.position.z = e; });
    lightSettings.add(lightingOptions, 'directionalLightRotationX', 0, 360).onChange(function(e) { directionalLight1.rotation.x = e; });
    lightSettings.add(lightingOptions, 'directionalLightRotationY', 0, 360).onChange(function(e) { directionalLight1.rotation.y = e; });
    lightSettings.add(lightingOptions, 'directionalLightRotationZ', 0, 360).onChange(function(e) { directionalLight1.rotation.z = e; });
    lightSettings.add(lightingOptions, 'spotlightIntensity', 0.0, 1.0).onChange(function(e) { spotLight.intensity = e; });
    lightSettings.add(lightingOptions, 'directionalLightIntensity', 0.0, 1.0).onChange(function(e) { directionalLight1.intensity = e; });
    var geometrySettings = gui.addFolder('Geometry Settings');
    geometrySettings.add(geometryOptions, 'multi').onChange(function(e) {
        showMultiMesh = e;
        if(e) {
            showCube = false;
            showSphere = false;
        }
    });
    geometrySettings.add(geometryOptions, 'cube').onChange(function(e) {
        showCube = e;
        if(e) {
            showMultiMesh = false;
            showSphere = false;
        }
    });
    geometrySettings.add(geometryOptions, 'sphere').onChange(function(e) {
        showSphere = e;
        if(e) {
            showMultiMesh = false;
            showCube = false;
        }
    });
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mouseover', onMouseMove);
    render();
};



function animate(time) {
    requestAnimationFrame(animate);
    orbitControls.update();
    if(showMultiMesh) {
        raycaster.setFromCamera( mouse, camera);
        const intersection = raycaster.intersectObject ( mesh );
        if(intersection.length > 0) {
            const instanceId = intersection[0].instanceId;
            mesh.getColorAt(instanceId, color);
            if(color.equals(white)) {
                mesh.setColorAt(instanceId, color.setHex(Math.random() * 0xffffff));
                mesh.instanceColor.needsUpdate = true;
            }
        }
    }
    handleDifferentGeometry(); 
    step += speed;
    mesh.position.y = 10 * Math.abs(Math.sin(step));
    render();
};

function handleDifferentGeometry()
{
    if(showMultiMesh) {
        if(!mesh.Mesh) {
            scene.remove(mesh);
            const geometry = new THREE.SphereGeometry(0.5, 64, 64);
            const material = new THREE.MeshToonMaterial( {color: 0x6C0BA9} );
            mesh = new THREE.InstancedMesh(geometry, material, count);
            let i = 0;
            const offset = (amount - 2) / 2 
            const matrix = new THREE.Matrix4();
            for ( let x = 0; x < amount; x++) {
                for(let y = 0; y < amount; y++) {
                    for(let z = 0; z < amount; z++) {
                        matrix.setPosition(offset - x, offset - y, offset - z);
                        
                        mesh.setMatrixAt(i, matrix);
                        mesh.setColorAt(i, color);
                        objects.push(mesh.children[i]);
                        i++;
                    }
                }
            }
            mesh.castShadow = true;
            scene.add(mesh);
        }
    }

    if(showCube) {
        if(!mesh.BoxGeometry) {
            scene.remove(mesh);
            const cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
            const cubeMaterial = new THREE.MeshToonMaterial( {color: 0x6C0BA9} );
            mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
            scene.add(mesh);
        }
    }

    if(showSphere) {
        if(!mesh.sphereGeometry) {
            scene.remove(mesh);
            const sphereGeometry = new THREE.SphereGeometry(10, 64, 64);
            const sphereMaterial = new THREE.MeshToonMaterial( {color: 0x6C0BA9} );
            mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            scene.add(mesh);
        }
    }
};

function render() {
    renderer.render(scene, camera);
};

function onMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onWindowResize() {
    width = threejsCanvas.offsetWidth;
    height = threejsCanvas.offsetHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}
