<template>
  <div style="display:flex">
    <div  v-bind:key="product.ref" v-for="product in products" @click="selectProduct(product)">
      <div class="catalogue-container" style="margin:10px 20px">

        <img v-bind:src="'/threejs/src/asset/'+product.ref|getImgUrl" v-bind:alt="product.name" style="max-height: 120px">
      </div>
    </div>
  </div>
</template>

<script>
  import getImgUrl from '../filters/getImgUrl';
  export default {
    name: 'FormProduct',
    data() {
      return {

      }
    },
    filters: {
      getImgUrl
    },
    computed: {
      products() {
        return this.$store.state.products;
      }
    },
    methods: {
      selectProduct(product){
        this.$store.commit('selectProduct', product);
        let event = new CustomEvent('selectProduct', {
          'detail': {
            product:product
          }
        });
        document.dispatchEvent(event);
      }
    },
  }
</script>
