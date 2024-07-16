<template>
  <MDBCard class="shadow-5">
    <MDBCardBody>
      <MDBCardTitle>{{ word }}</MDBCardTitle>
      <MDBCardText v-html="introductin_html"></MDBCardText>
    </MDBCardBody>
  </MDBCard>
</template>

<script setup lang="ts">
/* eslint-disable */
  import { MDBCard, MDBCardBody, MDBCardTitle, MDBCardText } from 'mdb-vue-ui-kit'
  import { ref } from 'vue'

  const word = ref('');
  const infos = ref({});
  const introductin_html = ref('');
  const body = document.getElementsByTagName('body')[0];
  let stick = false;

  function setup(info: [string, JSON], introductin_html: string) {
    word.value = info[0];
    infos.value = info[1];
    introductin_html.value = introductin_html;
  }

  body.addEventListener('mouseleave', () => {
    body.style.display = 'none';
  })
  body.addEventListener('mouseclick', () => {
    stick = true;
  })

  function show() {
    body.style.display = 'inherit';

  }
</script>

<style>
body{
  width: 46em;
  height: 28em;
  /* display: none;  */
  z-index: 999;
}
</style>
