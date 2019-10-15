<template>
  <div>
    <div v-if="!showRestForm">
      <input v-model="scene.width" placeholder="Largeur">
      <input v-model="scene.depth" placeholder="Profondeur">
      <button @click="onSubmitSceneFormat()">Submit</button>
    </div>
    <div v-else>
      <FormProduct/>
    </div>
  </div>
</template>

<script>
  import FormProduct from './FormProduct.vue'

  export default {
    name: 'FormScene',
    components: {
      FormProduct
    },

    data() {
      return {
        scene: {
          width: '',
          depth: ''
        },
        showRestForm: false
      }
    },
    methods: {
      onSubmitSceneFormat() {
        this.$store.commit('changeSceneFormat', this.scene);
        let event = new CustomEvent('build', {
            'detail': {
              'width': this.$store.state.scene.width,
              'depth': this.$store.state.scene.depth
            }
          });
        document.dispatchEvent(event);
        this.showRestForm = true
      },
      changeIdobj(id) {
        this.$store.commit('changeIdObj', id)
      }
    },
    mounted() {
      document.addEventListener('removeFromStore', (e) => {
        this.changeIdobj(e.detail.id);
      });
    }
  }
</script>
