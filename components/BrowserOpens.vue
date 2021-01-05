<template>
  <div class="dialog message" @click="show = false" v-if="show">
    <div class="bg"></div>
    <img :src="img||require('IMG/msg/img_yindao@2x.png')" alt="" />
  </div>
</template>
<script>
/* eslint-disable */
export default {
  data() {
    return {
      show: true,
      lan: null,
      img:null
    };
  },
};
</script>
<style lang="scss" scoped>
.message {
  text-align: right;
  .bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    opacity: 0.8;
    z-index: 10000;
  }

  > img {
    z-index: 10002;
    position: fixed;
    top: 0;
    right: rem1(140);
    width: rem1(500);
    object-fit: scale-down;
  }
}
</style>
