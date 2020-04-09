var THREE = require("three");
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

require("./TerrainLoader")
// import {img} from "../src/index_2"

var altitude_tile;

var scene, camera, renderer, orbit;
var perspective_camera;
var text_alt;
var side_length_y, side_length_x;

var mountain_height = 1518; // in meters
var xMid;
let altitude_plane;
var min_alt = 9999, max_alt = 0;
var label_font;

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

    render();

    var terrainLoader = new THREE.TerrainLoader()
    terrainLoader.load('dem.bin', function (data) {

        var width = (210) - 1;
        var height = (196) - 1;
        var error_alt = mountain_height - 1493;
        
        var geometry = new THREE.PlaneGeometry(150, 150 / ((width + 1) / (height + 1)), width, height);
        
        var alt;
        for (var i = 0, l = geometry.vertices.length; i < l; i++) {
            alt = data[i] + error_alt;
            geometry.vertices[i].z = alt / 40;

            if(alt < min_alt){
                min_alt = alt;
            }
            else if(alt > max_alt){
                max_alt = alt;
            }
        }
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
            function ( err ) {console.error( 'An error happened.' );}
        );

        render();
    });

}
var base_plane_z = 6;
function addBasePlane(width, height, geometry) {
    
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
    side_length_y = Math.abs(geometry.vertices[width].x - geometry.vertices[0].x)
    side_length_x = Math.abs(geometry.vertices[0].y - geometry.vertices[height * (width + 1)].y)

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
            shape.lineTo(geometry.vertices[((width + 1) * height)].x, base_plane_z);
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
    // scene.add(new THREE.AxesHelper(100))

    var geometry_base = new THREE.PlaneGeometry(side_length_y, side_length_x, 3);
    geometry_base.rotateX(Math.PI)
    geometry_base.translate(0, 0, base_plane_z)
    
    var plane_base = new THREE.Mesh(geometry_base, mat);
    scene.add(plane_base);

    var altitude_plane_geometry = new THREE.PlaneGeometry(side_length_y, side_length_x, 3);
    altitude_plane_geometry.rotateX(Math.PI);
    altitude_plane_geometry.translate(0, 0, base_plane_z);

    var mat_for_alt_plane = new THREE.MeshBasicMaterial({color : 0xbbbbbb, side : THREE.DoubleSide, transparent : true, opacity : .7})
    altitude_plane = new THREE.Mesh(altitude_plane_geometry, mat_for_alt_plane);
    
    scene.add(altitude_plane);

    var material_title = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });
    
    var points = [];
    points.push( new THREE.Vector3(0, 0,   base_plane_z ) );
    points.push( new THREE.Vector3(0, 0,  base_plane_z) );
    
    var geometry_title = new THREE.BufferGeometry().setFromPoints( points );
    geometry_title.translate( side_length_y / 2 + .1, side_length_x / 2 + .1,0)
    
    altitude_tile = new THREE.Line(geometry_title, material_title );
    scene.add( altitude_tile );
    
    var loader = new THREE.FontLoader();
    loader.load('styles/Zawgyi-One_Regular.json', function(font) {
        label_font = font;

        
        var color = 0xff0000;

        var matLite = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });

        var message = "ေပ ၁၀၀၀";

        var shapes = font.generateShapes(message, 4);

        var geometry = new THREE.ShapeBufferGeometry(shapes);

        geometry.computeBoundingBox();

        xMid = - (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

        geometry.translate(xMid - 1, 0, 0);
        geometry.rotateZ(Math.PI )
        geometry.rotateX(-Math.PI / 2)
        geometry.rotateZ(Math.PI / 4)

        text_alt = new THREE.Mesh(geometry, matLite);
        text_alt.position.z = 0 + base_plane_z;
        text_alt.position.x = side_length_y / 2 + .1;
        text_alt.position.y = side_length_x / 2 + .1;
        text_alt.visible = false;
        scene.add(text_alt);
    })

    handleActions();
    render();
}

function render() {
    renderer.render(scene, camera);
}

function handleActions(){
    var altitude_slider = document.getElementById("altitude-slider");
    
    altitude_slider.oninput = function(e){
        var value = parseFloat(altitude_slider.value);
        altitude_plane.position.set(0, 0, value - base_plane_z);  
    
        var shapes = label_font.generateShapes("ေပ " + parseInt( (value * 40)), 4);

        var text_geometry = new THREE.ShapeBufferGeometry(shapes);
        
        text_geometry.translate(xMid - 1, 0, 0);
        text_geometry.rotateZ(Math.PI )
        text_geometry.rotateX(-Math.PI / 2)
        text_geometry.rotateZ(Math.PI / 4)

        text_alt.geometry = text_geometry;

        if(value == 6){
            text_alt.visible = false;
        }
        else{
            text_alt.visible = true;
        }
        
        text_alt.position.x = side_length_y / 2 + .1;
        text_alt.position.y = side_length_x / 2 + .1;
        
        text_alt.position.z = value - 3;
        altitude_tile.geometry.attributes.position.array[5] = value;
        altitude_tile.geometry.attributes.position.needsUpdate = true;

        render()
    }
}

init()
