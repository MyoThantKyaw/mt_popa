var THREE = require("three");
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
// import { Mesh, Sphere, RedIntegerFormat, BoxGeometry } from 'three';

require("./TerrainLoader")
// import {img} from "../src/index_2"


var scene, camera, renderer, orbit;
var perspective_camera;
var ball;
var pointLight;

function init() {


    // var image = new Image();
    // image.src = img.data;
    // document.body.appendChild(image);

    // return
    var view_3d = document.getElementById("view-3d");

    var body = document.body,
        html = document.documentElement;

    var height = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);

    view_3d.style.width = 100 + "%"
    view_3d.style.height = height + "px";

    var position_info = view_3d.getBoundingClientRect();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.canvas = view_3d;
    renderer.setSize(position_info.width, position_info.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xbedcf7);
    renderer.localClippingEnabled = true;

    view_3d.appendChild(renderer.domElement);

    perspective_camera = new THREE.PerspectiveCamera(45, position_info.width / position_info.height, 1, 1000);

    camera = perspective_camera;
    camera.position.set(200,  200, 50)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    camera.up.set(0, 0, 1);

    scene = new THREE.Scene();

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.addEventListener("change", render)
    orbit.saveState();

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(50, 50, 50);

    // scene.add(new THREE.AxesHelper(100))
    // var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    // hemiLight.color.setHSL(0.6, 1, 0.6);
    // hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    // hemiLight.position.set(0, 50, 0);
    // //    scene.add( hemiLight );
    // hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    // hemiLight.color.setHSL(0.6, 1, 0.6);
    // hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    // hemiLight.position.set(0, 50, 0);
    // scene.add( hemiLight );

    // var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    // dirLight.color.setHSL(0.1, 1, 0.95);
    // dirLight.position.set(100, 50, 100);
    // dirLight.position.multiplyScalar(30);
    // //scene.add( dirLight );

    // var dirLight1 = new THREE.DirectionalLight(0xffffff, 1);
    // dirLight1.color.setHSL(0.1, 1, 0.95);
    // dirLight1.position.set(-100, -50, -100);
    // dirLight1.position.multiplyScalar(30);
    // ///scene.add( dirLight1 );

    // pointLight = new THREE.PointLight(0xffffff, 1);
    // pointLight.position.copy(camera.position);
    // scene.add(pointLight);

    // var spotLight1 = new THREE.SpotLight(0xffffff);
    // spotLight1.position.set(-50, -50, -50);

    // scene.add(spotLight1)
    // loadTerrain();
    render();

    var terrainLoader = new THREE.TerrainLoader()
    terrainLoader.load('dem.bin', function (data) {

        var width = (210) - 1;
        var height = (196) - 1;
        
        var geometry = new THREE.PlaneGeometry(150, 150 / ((width + 1) / (height + 1)), width, height);
        // var geometry_buffer = new THREE.PlaneBufferGeometry(150, 150 * ((height + 1)/ (width + 1)) , width, height);

        for (var i = 0, l = geometry.vertices.length; i < l; i++) {
            geometry.vertices[i].z = (data[i] / 40) - 10;
           
        }
        
        // let pos = geometry_buffer.getAttribute("position");
        // let pa = pos.array;

        // var hVerts = width  + 1;
        // var wVerts = height + 1;

        // var index = 0
        // for (let j = 0; j < hVerts; j++) {
        //     for (let i = 0; i < wVerts; i++) {
        //         pa[3*(j*wVerts+i)+2] =  (data[index++] / 33) - 10;
        //     }
        // }
        // pos.needsUpdate = true;
        var bufferGeometry = new THREE.BufferGeometry().fromGeometry( geometry );

        var texture_loader = new THREE.TextureLoader();

        texture_loader.load(
            // resource URL
            'texture.jpg',
        
            // onLoad callback
            function ( texture ) {
                // in this example we create the material when the texture is loaded
                var material = new THREE.MeshBasicMaterial({
            
                    map: texture,
            
                });
        
                var plane = new THREE.Mesh(bufferGeometry, material);
                
                scene.add(plane);
                addBasePlane(width, height, geometry)
                
                render();
            },
        
            // onProgress callback currently not supported
            undefined,
        
            // onError callback
            function ( err ) {
                console.error( 'An error happened.' );
            }
        );
        

        

        render();
    });

}

function addBasePlane(width, height, geometry) {
    var base_plane_z = -2.7;
    var mat = new THREE.MeshBasicMaterial({ color: 0x84796e});
    var points = []

    var shape = new THREE.Shape();

    for (var j = 0; j < width + 1; j++) {
        if (j == 0) {
            points.push(geometry.vertices[0].x)
            points.push(geometry.vertices[0].y)
            points.push(base_plane_z)
            shape.moveTo(geometry.vertices[0].x, base_plane_z)
        }

        points.push(geometry.vertices[j].x)
        points.push(geometry.vertices[j].y)
        points.push(geometry.vertices[j].z)
        shape.lineTo(geometry.vertices[j].x, geometry.vertices[j].z)

        if (j == width) {
            points.push(geometry.vertices[j].x)
            points.push(geometry.vertices[j].y)
            points.push(base_plane_z)
            shape.lineTo(geometry.vertices[j].x, base_plane_z)

            points.push(geometry.vertices[0].x)
            points.push(geometry.vertices[0].y)
            points.push(base_plane_z)
            shape.lineTo(geometry.vertices[0].x, base_plane_z)
        }
    }
    var side_length_y = Math.abs(geometry.vertices[width].x - geometry.vertices[0].x)
    var side_length_x = Math.abs(geometry.vertices[0].y - geometry.vertices[height * (width + 1)].y)

    var material_side_plane = new THREE.MeshBasicMaterial({ color: 0xafa192 })
    var geometry_shape = new THREE.ShapeBufferGeometry(shape);
    geometry_shape.rotateX(Math.PI / 2)
    geometry_shape.translate(0, side_length_x / 2, 0)

    material_side_plane = new THREE.MeshBasicMaterial({ color: 0xafa192 , side : THREE.BackSide})
    var mesh_shape = new THREE.Mesh(geometry_shape, material_side_plane);
    scene.add(mesh_shape)

    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(points), 3));

    var mesh = new THREE.Line(geo, mat);
    scene.add(mesh)

    points = []
    shape = new THREE.Shape();

    var j = 0;
    for (var i = 0; i < height + 1; i++) {

        j = i * (width + 1)

        if (i == 0) {
            points.push(geometry.vertices[0].x)
            points.push(geometry.vertices[0].y)
            points.push(base_plane_z)
            shape.moveTo(geometry.vertices[0].y, base_plane_z)
        }

        points.push(geometry.vertices[j].x)
        points.push(geometry.vertices[j].y)
        points.push(geometry.vertices[j].z)
        shape.lineTo(geometry.vertices[j].y, geometry.vertices[j].z)

        if (i == height) {
            points.push(geometry.vertices[j].x)
            points.push(geometry.vertices[j].y)
            points.push(base_plane_z)
            shape.lineTo(geometry.vertices[j].y, base_plane_z)

            points.push(geometry.vertices[0].x)
            points.push(geometry.vertices[0].y)
            points.push(base_plane_z)
            shape.lineTo(geometry.vertices[0].y, base_plane_z)
        }
    }

    geometry_shape = new THREE.ShapeBufferGeometry(shape);
    geometry_shape.rotateX(Math.PI / 2)
    geometry_shape.rotateZ(Math.PI / 2)
    geometry_shape.translate(-side_length_y / 2, 0, 0)

    
    material_side_plane = new THREE.MeshBasicMaterial({ color: 0xafa192, side : THREE.BackSide })
    mesh_shape = new THREE.Mesh(geometry_shape, material_side_plane);
    scene.add(mesh_shape)

    geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(points), 3));

    mesh = new THREE.Line(geo, mat);
    scene.add(mesh)

    points = []
    shape = new THREE.Shape();

    j = 0;
    
    for (var i = 0; i < width + 1; i++) {

        j = ((width + 1) * height) + i

        if (i == 0) {
            points.push(geometry.vertices[j].x)
            points.push(geometry.vertices[j].y)
            points.push(base_plane_z)
            shape.moveTo(geometry.vertices[j].x, base_plane_z)

        }

        points.push(geometry.vertices[j].x)
        points.push(geometry.vertices[j].y)
        points.push(geometry.vertices[j].z)
        shape.lineTo(geometry.vertices[j].x, geometry.vertices[j].z)

        if (i == width) {
            points.push(geometry.vertices[j].x)
            points.push(geometry.vertices[j].y)
            points.push(base_plane_z)
            shape.lineTo(geometry.vertices[j].x, base_plane_z)

            points.push(geometry.vertices[((width + 1) * height)].x)
            points.push(geometry.vertices[((width + 1) * height)].y)
            points.push(base_plane_z)
            shape.lineTo(geometry.vertices[((width + 1) * height)].x, base_plane_z)

        }
    }
    geometry_shape = new THREE.ShapeBufferGeometry(shape);
    geometry_shape.rotateX(Math.PI / 2)
    geometry_shape.translate(0, -side_length_x / 2, 0)

    
    material_side_plane = new THREE.MeshBasicMaterial({ color: 0xafa192 , side : THREE.FrontSide})
    mesh_shape = new THREE.Mesh(geometry_shape, material_side_plane);
    scene.add(mesh_shape)


    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(points), 3));

    var mesh = new THREE.Line(geo, mat);
    scene.add(mesh)

    points = []
    shape = new THREE.Shape();

    j = 0;
    for (var i = 0; i < height + 1; i++) {

        j = (i * (width + 1)) + width

        if (i == 0) {
            points.push(geometry.vertices[j].x)
            points.push(geometry.vertices[j].y)
            points.push(base_plane_z)
            shape.moveTo(geometry.vertices[j].y, base_plane_z)

        }

        points.push(geometry.vertices[j].x)
        points.push(geometry.vertices[j].y)
        points.push(geometry.vertices[j].z)
        shape.lineTo(geometry.vertices[j].y, geometry.vertices[j].z)

        if (i == height) {
            points.push(geometry.vertices[j].x)
            points.push(geometry.vertices[j].y)
            points.push(base_plane_z)
            shape.lineTo(geometry.vertices[j].y, base_plane_z)

            points.push(geometry.vertices[width].x)
            points.push(geometry.vertices[width].y)
            points.push(base_plane_z)
            shape.lineTo(geometry.vertices[width].y, base_plane_z)

        }
    }

    geometry_shape = new THREE.ShapeBufferGeometry(shape);
    geometry_shape.rotateX(Math.PI / 2)
    geometry_shape.rotateZ(Math.PI / 2)
    geometry_shape.translate(side_length_y / 2, 0, 0)

    
    material_side_plane = new THREE.MeshBasicMaterial({ color: 0xafa192 , side : THREE.FrontSide})

    mesh_shape = new THREE.Mesh(geometry_shape, material_side_plane);
    scene.add(mesh_shape)


    geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(points), 3));

    var mesh = new THREE.Line(geo, mat);
    scene.add(mesh)

    var geometry_base = new THREE.PlaneGeometry( side_length_y,side_length_x, 3);
    geometry_base.rotateX(Math.PI)
    geometry_base.translate(0, 0, base_plane_z)
    
    var plane_base = new THREE.Mesh(geometry_base, mat);
    scene.add(plane_base);

    render();
}

function loadTerrain(file, callback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.open('GET', file, true);
    xhr.onload = function (evt) {
        if (xhr.response) {
            callback(new Uint16Array(xhr.response));
        }
    };
    xhr.send(null);
}

function render() {
    renderer.render(scene, camera);
}

init()
