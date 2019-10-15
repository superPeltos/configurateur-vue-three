import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    scene : {
      width:0,
      height:0
    },
    idObj:0,
    products: [
      {
        ref: "810.8022",
        name: "Armoire 24'' hauteur 1980mm",
        category: 1,
        dimension: {
          height: 1980,
          width: 600,
          depth: 526
        },
        image: {
          "dimension": {
            "width": 108,
            "height": 356
          }
        }
      },
      {
        ref: "810.8057",
        name: "Armoire double 2 tiroirs",
        category: 1,
        dimension: {
          height: 1950,
          width: 903,
          depth: 518
        },
        image: {
          dimension: {
            width: 162,
            height: 351
          }
        }
      },
    ],
    selectedProduct : {}
  },
  getters: {
    idObj: state => state.idObj,
    scene: state => state.scene,
    products: state => state.products,
    selectedProduct: state => state.selectedProduct
  },
  mutations: {
    selectProduct(state,product){
      state.selectedProduct = product;
    },
    changeSceneFormat(state, scene){
      state.scene = scene;
    },
    changeIdObj(state, idObj){
      state.idObj = idObj;
    }
  }
});
