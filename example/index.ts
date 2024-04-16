import { MappingDiagram } from "../src/index";


const treeInit = [
  {
    id: "zs-1",
    name: "zhangsan",
    children: [
      {
        id: "zs-1-1",
        name: "zhangsan-1",
      },
      {
        id: "zs-1-2",
        name: "zhansgan-2",
      },
    ],
  },
  {
    id: "ls-2",
    name: "lisi",
  },
  {
    id: "ww-3",
    name: "wangwu",
    children: [
      {
        id: "ww-3-1",
        name: "wangwu - 1",
      },
      {
        id: "ww-3-2",
        name: "wangwu - 2",
        children: [
          {
            id: "ww-3-2-1",
            name: "wangwu - 2 - 1",
          },
        ],
      },
    ],
  },
];

const listInit = [
  {
    id: "1",
    label: "工程师",
  },
  {
    id: "2",
    label: "设计师",
  },
];

const mapInit = {
  "ww-3-2-1": ["1"],
};

const canvas = document.createElement('canvas')
canvas.style.width = '640px'
canvas.style.height = '360px'
document.body.appendChild(canvas)

const { width, height } = canvas.getBoundingClientRect()

const instance = new MappingDiagram(
  canvas, 
  listInit, 
  treeInit, 
  mapInit, 
  {
    width: 640,
    height: 360
    // width,
    // height
  }
)

instance.mounted()

const btn = document.createElement('button')
btn.innerHTML = 'get Map'

btn.addEventListener('click', () => {
  console.log(instance)
})
document.body.appendChild(btn)
