
var THREE = require("three");
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
import { Mesh, Sphere, RedIntegerFormat } from 'three';

var scene, camera, renderer, orbit;
var perspective_camera;
var ball;
var pointLight;

function getFig1_1No1(container_id) {
    var view_3d = document.getElementById(container_id);

    var body = document.body,
        html = document.documentElement;

    var height = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);

    var position_info = view_3d.getBoundingClientRect();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.canvas = view_3d;
    renderer.setSize(position_info.width, position_info.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xfffff);
    view_3d.appendChild(renderer.domElement);

    perspective_camera = new THREE.PerspectiveCamera(45, position_info.width / position_info.height, 1, 1000);

    camera = perspective_camera;
    camera.position.set(10, 5, 10)
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(4))

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.addEventListener("change", render)
    orbit.saveState();

    render();

}

function render() {
    pointLight.position.copy(camera.position);
    renderer.render(scene, camera);
}

export {getFig1_1No1}