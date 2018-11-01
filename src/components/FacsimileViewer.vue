<template>
<div class="parzival-facsimile-viewer">
  <div class="parzival-facsimile"></div>
  <div class="parzival-facsimile-nav">
    <div class="field has-addons">
      <div class="control">
        <button class="button" @click="zoomIn"><i class="fa fa-search-plus"></i></button>
      </div>
      <div class="control">
        <button class="button" @click="zoomOut"><i class="fa fa-search-minus"></i></button>
      </div>
      <div class="control">
        <button class="button" @click="rotateLeft"><i class="fa fa-rotate-left"></i></button>
      </div>
      <div class="control">
        <button class="button" @click="rotateRight"><i class="fa fa-rotate-right"></i></button>
      </div>
    </div>
  </div>
  <figure class="image parzival-quire-view" v-if="quireIconPath">
    <img :src="quireIconPath"/>
  </figure>
</div>
</template>

<script>
export { default } from './FacsimileViewer'
</script>
