import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let renderer, controls, scene, camera,raycaster, mouse;
let shade, selectedObject = null, lastMousePos = { x: 0, y: 0 };
const selectableObjects = [];

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function handleMouseDown(e) {
    var x = 2 * (e.clientX - window.innerWidth / 2) / window.innerWidth;
    var y = -2 * (e.clientY - window.innerHeight / 2) / window.innerHeight;

    lastMousePos.x = x;
    lastMousePos.y = y;

    raycaster.setFromCamera({ x: x, y: y }, camera);
    var intersects = raycaster.intersectObjects(selectableObjects);
    if (intersects.length > 0) {
        selectedObject = intersects.reduce((closest, intersect) => {
          return !closest || intersect.distance < closest.distance ? intersect : closest;
        }, null).object;
    
        selectedObject.dispatchEvent({ type: 'click' });
      } else {
        selectedObject = null;
      }
}

function handleMouseMove(e) {
    if (selectedObject != null) {
        var x = 2 * (e.clientX - window.innerWidth / 2) / window.innerWidth;
        var y = -2 * (e.clientY - window.innerHeight / 2) / window.innerHeight;
        var dx = x - lastMousePos.x;
        var dy = y - lastMousePos.y;

        if (selectedObject.canRotate) {
            selectedObject.parent.rotation.x += dx;
            selectedObject.parent.rotation.z += dy;
        } else if (selectedObject.canTranslate) {
            selectedObject.position.x += dx * 4;
            selectedObject.position.z -= dy * 4;
        }

        lastMousePos.x = x;
        lastMousePos.y = y;
    }
}

function draw() {
    const c = document.getElementById("canvas");
    renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();

    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 1.3, 10);

    const ambientLight = new THREE.AmbientLight(0x404040, 3);
    scene.add(ambientLight);

    controls = new OrbitControls(camera, renderer.domElement);

    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 2, 1, 32),
        new THREE.MeshStandardMaterial({ color: 0x123123 })
    );
    base.position.y = 0;
    base.canRotate = false;
    base.canTranslate = false;
    scene.add(base);

    const bottomLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 3, 32),
        new THREE.MeshLambertMaterial({ color: '#B4CA20' })
    );
    const bottomLegPivot = new THREE.Object3D();
    bottomLegPivot.position.set(0, 0, 0);
    bottomLeg.position.set(0, 1.5, 0);
    bottomLegPivot.add(bottomLeg);
    base.add(bottomLegPivot);
    bottomLegPivot.rotation.z = -Math.PI / 6;
    bottomLeg.canRotate = false;
    bottomLeg.canTranslate = false;

    const topArm = new THREE.Mesh(
        new THREE.CylinderGeometry(-0.1, -0.1, -2, 32),
        new THREE.MeshLambertMaterial({ color: '#B4CA20' })
    );
    const topArmPivot = new THREE.Object3D();
    topArmPivot.position.set(-1, 1.4, 0);
    topArmPivot.add(topArm);
    bottomLeg.add(topArmPivot);
    topArmPivot.rotation.z = Math.PI / 2;
    topArm.canRotate = false;
    topArm.canTranslate = false;

    const shadeGeometry = new THREE.ConeGeometry(1.5, -1.1, 32);
    const shadeMaterial = new THREE.MeshStandardMaterial({ color: '#7B8A16' });
    shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
    const lampShadePivot = new THREE.Object3D();
    lampShadePivot.position.set(0, 1.33, 0);
    lampShadePivot.add(shade);
    lampShadePivot.position.set(0, 1.33, 0);
    topArm.add(lampShadePivot);
    shade.canRotate = true;
    shade.canTranslate = true;
    selectableObjects.push(shade);


    const pointLight = new THREE.PointLight(0xffffff, 10, 10);
    pointLight.position.set(0, 0.5, 0);
    shade.add(pointLight);
    shade.lightOn = true;

    shade.addEventListener('click', () => {
        shade.lightOn = !shade.lightOn;
        pointLight.visible = shade.lightOn;
    });

    const tableGeometry = new THREE.BoxGeometry(10, 0.5, 10);
    const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = -0.05;
    scene.add(table);

    const objects = [];
    const stickyNotes = new THREE.BoxGeometry(2, 0.3, 2);
    const objectMaterial1 = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const objectMaterial2 = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const objectMaterial3 = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const objectMaterial4 = new THREE.MeshStandardMaterial({ color: 0xffa500 });
    const object1 = new THREE.Mesh(stickyNotes, objectMaterial1);
    const object2 = new THREE.Mesh(stickyNotes, objectMaterial2);
    const object3 = new THREE.Mesh(stickyNotes, objectMaterial3);
    const object4 = new THREE.Mesh(stickyNotes, objectMaterial4);
    object1.position.set(-2, 0.30, -2.5);
    object2.position.set(-2, 0.6, -2.5);
    object3.position.set(-2, 0.9, -2.5);
    object4.position.set(-2, 1.2, -2.5);
    objects.push(object1, object2, object3,object4), 
    objects.forEach(obj => scene.add(obj));

    
    const movingObject = new THREE.Mesh(new THREE.CylinderGeometry(.5,0.5,2), objectMaterial1);
    movingObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    movingObject.position.set(4, 0.65, 3);
    scene.add(movingObject);

    let direction = 1;
    function animateMovingObject() {
        requestAnimationFrame(animateMovingObject);
        movingObject.position.x += 0.05 * direction;
        if (movingObject.position.x > 4 || movingObject.position.x < -4) {
            direction *= -1;
        }
        renderer.render(scene, camera);
    }

    animateMovingObject();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    c.onmousedown = handleMouseDown;
    c.onmousemove = handleMouseMove;
    c.onmouseup = function(e) {
        selectedObject = null;
    };

    animate();
}

window.onload = draw;