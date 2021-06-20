import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BoxGeometry, CylinderGeometry, MeshPhongMaterial, TorusGeometry } from 'three'
import * as dat from 'dat.gui'



//link to DOM Element
const canvas = document.querySelector('.webgl')

//manage loading images using loadingManager and log status
const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () => {
    console.log('loading started')
}
loadingManager.onProgress = () => {
    console.log('loading in progress..')
}
loadingManager.onLoad = () => {
    console.log('loading complete')
}
loadingManager.onError = () => {
    console.log('loading failed')
}

//textureloader takes loading manager as argument
const textureLoader = new THREE.TextureLoader(loadingManager)

//load images using textureLoader -wood
const woodColorTexture = textureLoader.load('/wood/basecolor.jpg')
// woodColorTexture.repeat.x = 2
// woodColorTexture.repeat.y = 2
// woodColorTexture.wrapS = THREE.RepeatWrapping
// woodColorTexture.wrapT = THREE.RepeatWrapping
woodColorTexture.generateMipmaps = false
woodColorTexture.minFilter = THREE.NearestFilter

const woodAmbientOcclusionTexture = textureLoader.load('/wood/ambientOcclusion.jpg')
const woodHeightTexture = textureLoader.load('/wood/height.png')
const woodNormalTexture = textureLoader.load('/wood/normal.jpg')
const woodRoughnessTexture = textureLoader.load('/wood/roughness.jpg')
const woodMetalnessTexture = textureLoader.load('/wood/metallic.jpg')

//glass texture
const glassColorTexture = textureLoader.load('/glass/basecolor.jpg')
const glassAmbientOcclusionTexture = textureLoader.load('/glass/ambientOcclusion.jpg')
const glassHeightTexture = textureLoader.load('/glass/height.png')
const glassNormalTexture = textureLoader.load('/glass/normal.jpg')
const glassRoughnessTexture = textureLoader.load('/glass/roughness.jpg')

//honeycomb texture
const honeycombColorTexture = textureLoader.load('/honeycomb/basecolor.jpg')
const honeycombAmbientOcclusionTexture = textureLoader.load('/honeycomb/ambientOcclusion.jpg')
const honeycombHeightTexture = textureLoader.load('/honeycomb/height.png')
const honeycombNormalTexture = textureLoader.load('/honeycomb/normal.jpg')
const honeycombRoughnessTexture = textureLoader.load('/honeycomb/roughness.jpg')

//environmentMapTexture
const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMapTexture = cubeTextureLoader.load([
    '/environmentMaps/1/px.jpg',
    '/environmentMaps/1/nx.jpg',
    '/environmentMaps/1/py.jpg',
    '/environmentMaps/1/ny.jpg',
    '/environmentMaps/1/pz.jpg',
    '/environmentMaps/1/nz.jpg'
])

//create scene
const scene = new THREE.Scene()

//let there be light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.x = 5
pointLight.position.y = 4
pointLight.position.z = 5
scene.add(pointLight)



//materials
const boxMaterial = new THREE.MeshPhongMaterial()
boxMaterial.map = woodColorTexture
// boxMaterial.shininess = 100
// boxMaterial.specular = new THREE.Color(0x1188ff)
boxMaterial.metalness = 0.45
boxMaterial.roughness = 0.65

const cylinderMaterial = new THREE.MeshPhongMaterial()
cylinderMaterial.map = glassColorTexture

cylinderMaterial.shininess = 100
cylinderMaterial.specular = new THREE.Color(0x1188ff)

const sphereMaterial = new THREE.MeshPhongMaterial()
sphereMaterial.map = honeycombColorTexture

sphereMaterial.shininess = 100
sphereMaterial.specular = new THREE.Color(0x1188ff)

//create sphere
const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 16), sphereMaterial)
sphere.position.x = -4

//create cube
const cube = new THREE.Mesh(new BoxGeometry(2.5, 2.5, 2.5, 180, 180, 180), boxMaterial)
cube.position.x = 4

//uv2 attribute
cube.geometry.setAttribute('uv2', new THREE.BufferAttribute(cube.geometry.attributes.uv.array, 2))
boxMaterial.aoMap = woodAmbientOcclusionTexture
boxMaterial.aoMapIntensity = 0.1
boxMaterial.displacementMap = woodHeightTexture
boxMaterial.displacementScale = 0.1
boxMaterial.displacementBias = -0.03
boxMaterial.metalnessMap = woodMetalnessTexture
boxMaterial.roughnessMap = woodRoughnessTexture
boxMaterial.normalMap = woodNormalTexture
boxMaterial.normalScale.set(0.5, 0.5)
// boxMaterial.envMap = environmentMapTexture


//create cylinder
const cylinder = new THREE.Mesh(new CylinderGeometry( 1.5, 1.5, 3, 32, 64), cylinderMaterial)
cylinderMaterial.aoMap = glassAmbientOcclusionTexture
cylinderMaterial.aoMapIntensity = 0.1
cylinderMaterial.displacementMap = glassHeightTexture
cylinderMaterial.displacementScale = 0.01

//uv2 attribute
cylinder.geometry.setAttribute('uv2', new THREE.BufferAttribute(cylinder.geometry.attributes.uv.array, 2))

scene.add(sphere, cube, cylinder)

//debug panel
const gui = new dat.GUI()
const boxDebug = gui.addFolder('Cube')
boxDebug.add(boxMaterial, 'metalness').min(0).max(1).step(0.001)
boxDebug.add(boxMaterial, 'roughness').min(0).max(1).step(0.001)

const sphereDebug = gui.addFolder('Sphere')
const cylinderDebug = gui.addFolder('Cylinder')

//create camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 100)
camera.position.z = 10
scene.add(camera)

//orbit controls
const controls = new OrbitControls(camera, canvas)
// controls.autoRotate = true
controls.enableDamping = true
controls.update()

//create renderer
const renderer = new THREE.WebGLRenderer({canvas})
renderer.setSize(window.innerWidth, window.innerHeight)

//add event listener for resize of screen
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
})

const clock = new THREE.Clock()

//update screen
const update = () => {
    const elapsedTime = clock.getElapsedTime()

    //rotate objects
    sphere.rotation.y = 0.2 * elapsedTime
    cube.rotation.y = 0.2 * elapsedTime
    cylinder.rotation.y = 0.2 * elapsedTime

    controls.update()
    
    renderer.render(scene, camera)

    window.requestAnimationFrame(update)
}

update()
