<template>
  <div ref="container"></div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default {
  mounted () {
    this.drawCube()
  },
  methods: {
    drawCube () {
      // 创建场景
      const scene = new THREE.Scene();
      // 创建相机，下面有透视相机的具体解释
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      //创建渲染器对象
      const renderer = new THREE.WebGLRenderer();
      //设置渲染器为文档显示区的宽度与高度
      renderer.setSize(window.innerWidth, window.innerHeight);
      // 将渲染器dom添加到页面的容器中
      this.$refs.container.appendChild(renderer.domElement);
      // 创建一个立方体几何对象
      const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
      // 我们将6个视觉的图片贴到立方体的6个面
      let picList = ["px", "nx", "py", "ny", "pz", "nz",];
      let boxMaterials = [];
      picList.forEach((item) => {
        let texture = new THREE.TextureLoader().load(
          require(`@/assets/${item}.png`)
        );
        boxMaterials.push(new THREE.MeshBasicMaterial({ map: texture }));
      });
      const axesHelper = new THREE.AxesHelper(150);
      const cube = new THREE.Mesh(boxGeometry, boxMaterials);
      // 在场景中加入创建的立方体
      scene.add(cube);
      scene.add(axesHelper);

      // cube.geometry.scale(10, 10, 10);
      camera.position.z = 5
      // 添加轨道控制器
      const controls = new OrbitControls(camera, renderer.domElement);
      const animate = function () {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
    }
  }
}
</script>
