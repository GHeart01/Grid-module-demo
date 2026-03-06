import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { EffectComposer } from 'three/examples/jsm/Addons.js'
import { RenderPass } from 'three/examples/jsm/Addons.js'
import { ShaderPass } from 'three/examples/jsm/Addons.js'
import { VignetteShader } from 'three/examples/jsm/Addons.js'

import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)
// scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xaaaaff, 1.5)
directionalLight.position.set(0, .5, - 1)
gui.add(directionalLight, 'intensity').min(0).max(3).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)



/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001).name("layer0 metalness")
gui.add(material, 'roughness').min(0).max(1).step(0.001).name("layer0 roughness")

/**
 * Objects
 */
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5

// upper material
const geometry = new THREE.PlaneGeometry(1, 1)

const material1 = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    // wireframe: false
})
material1.roughness = 1
material1.metalness = 1
for (let i = -10; i < 10; i++) {
    for (let j = -10; j < 10; j++){

        const plane = new THREE.Mesh(geometry,
            material1)

        const spacing = 1.01
        plane.position.z = j * spacing 
        plane.position.x = i * spacing
        plane.rotation.x = (Math.PI / 2)

        scene.add(plane)
}
}
gui.add(material1, 'metalness').min(0).max(1).step(0.001).name("layer1 metalness")
gui.add(material1, 'roughness').min(0).max(1).step(0.001).name("layer1 roughness")



scene.add(plane)

/** Helpers
 * 
 */
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

/**
 * Shadows
 */




/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.rotation.set(0, 0, 0)
camera.position.x = 0
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
// renderer.shadowMap.type = THREE.BasicShadowMap
// renderer.shadowMap.type = THREE.PCFShadowMap
renderer.shadowMap.type = THREE.VSMShadowMap

/**
 * Preprocessing and Vignette
 */

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const vignettePass = new ShaderPass(VignetteShader);
vignettePass.uniforms['offset'].value = .6; // how far the vignette extends
vignettePass.uniforms['darkness'].value = 1.5; // vignette darkness
composer.addPass(vignettePass);

const vignetteFolder = gui.addFolder('Vignette');

// Add controls directly to main GUI
gui.add(vignettePass.uniforms['offset'], 'value')
    .name('Vignette Offset')
    .min(0.0)
    .max(2.0)
    .step(0.01);

gui.add(vignettePass.uniforms['darkness'], 'value')
    .name('Vignette Darkness')
    .min(0.0)
    .max(2.5)
    .step(0.01);

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    // renderer.render(scene, camera)
    composer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()